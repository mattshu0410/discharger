import type { NextFetchEvent, NextRequest } from 'next/server';
import { detectBot } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';

const isProtectedRoute = createRouteMatcher([
  '/discharge(.*)', // Protect the main app
  '/dashboard(.*)', // Protect dashboard and sub-routes
  '/memory(.*)', // Protect memory pages
  '/api(.*)', // Protect API routes
  '/composer(.*)', // Protect composer pages
]);

const isAlwaysPublicRoute = createRouteMatcher([
  '/patient(.*)', // Public patient portal
]);

const isConditionallyPublicRoute = createRouteMatcher([
  '/api/patient-summaries/:id/summary', // Public when access_key provided
  '/api/patient-summaries/:id/translate', // Public when access_key provided
  '/api/patient-summaries/:id/translations', // Public when access_key provided
  '/api/patient-summaries/:id/translations/:locale', // Public when access_key provided
]);

// Smart function to determine if route should be public
const isPublicRoute = (request: NextRequest): boolean => {
  // Always public routes
  if (isAlwaysPublicRoute(request)) {
    return true;
  }

  // Conditionally public routes - only public if access_key parameter exists
  if (isConditionallyPublicRoute(request)) {
    const url = new URL(request.url);
    const hasAccessKey = url.searchParams.has('access_key');
    return hasAccessKey;
  }

  return false;
};

const isAuthPage = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // Optional: Bypass auth for development testing
  if (BYPASS_AUTH) {
    // console.warn('🔓 Auth bypass enabled');
    return NextResponse.next();
  }

  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Run Clerk middleware for routes that need it (both auth pages and protected routes)
  // But exclude public routes from both middleware and protection
  const routeIsPublic = isPublicRoute(request);
  const needsClerkMiddleware = (isAuthPage(request) || isProtectedRoute(request)) && !routeIsPublic;

  if (needsClerkMiddleware) {
    return clerkMiddleware(async (auth, req) => {
      // Only enforce authentication on protected routes (not auth pages or public routes)
      if (isProtectedRoute(req) && !isPublicRoute(req)) {
        const signInUrl = new URL('/sign-in', req.url);
        // Preserve the original URL as a return parameter
        signInUrl.searchParams.set('return_url', req.url);
        await auth.protect({
          unauthenticatedUrl: signInUrl.toString(),
        });

        // User profiles are now created via Clerk webhooks
        // No need to ensure profile creation in middleware
      }
      // Auth pages (/sign-in, /sign-up) get Clerk middleware but no protection
      return NextResponse.next();
    })(request, event);
  }

  return NextResponse.next();
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
};
