import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with Clerk auth integration
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      accessToken: async () => {
        try {
          const authObject = await auth();
          const token = await authObject.getToken();
          return token;
        } catch (error) {
          console.error('Error getting Clerk token for Supabase:', error);
          // Return null to use anonymous access if Clerk auth fails
          return null;
        }
      },
    },
  );
}

// Helper function to create unauthenticated Supabase client for public operations
export function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
  );
}
