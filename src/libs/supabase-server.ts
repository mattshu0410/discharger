import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client with Clerk auth
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Use Clerk's JWT as the access token for Supabase RLS
        fetch: async (url, options = {}) => {
          try {
            const authObject = await auth();
            const clerkToken = await authObject.getToken({ template: 'supabase' });

            const headers = new Headers(options?.headers);
            if (clerkToken) {
              headers.set('Authorization', `Bearer ${clerkToken}`);
            }

            return fetch(url, {
              ...options,
              headers,
            });
          } catch {
            // If there's no authenticated session, just use the anon key
            // This is expected for unauthenticated users
            return fetch(url, options);
          }
        },
      },
    },
  );
}
