import type { NextFetchEvent, NextRequest } from 'next/server';
import arcjet from '@/libs/Arcjet';
import { detectBot } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/', // Protect the homepage
  '/dashboard(.*)', // Protect dashboard and sub-routes
  '/memory(.*)', // Protect memory pages
  '/api(.*)', // Protect API routes
]);

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
  console.warn('🔍 Middleware running for:', request.nextUrl.pathname);
  console.warn('🔍 BYPASS_AUTH:', BYPASS_AUTH);

  // Test the route matcher
  const isProtected = isProtectedRoute(request);
  console.warn('🔍 Is protected route:', isProtected);

  // Optional: Bypass auth for development testing
  if (BYPASS_AUTH) {
    console.warn('🔓 Auth bypass enabled');
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
  const needsClerkMiddleware = isAuthPage(request) || isProtectedRoute(request);

  if (needsClerkMiddleware) {
    return clerkMiddleware(async (auth, req) => {
      // Only enforce authentication on protected routes (not auth pages)
      if (isProtectedRoute(req)) {
        console.warn('🔍 Route is protected, checking auth...');

        // Debug: Check what Clerk thinks about the current auth state
        const authState = await auth();
        const userId = authState.userId;
        console.warn('🔍 Clerk userId:', userId);
        console.warn('🔍 Is authenticated:', !!userId);

        const signInUrl = new URL('/sign-in', req.url);
        await auth.protect({
          unauthenticatedUrl: signInUrl.toString(),
        });
        console.warn('🔍 Auth check passed!');
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
