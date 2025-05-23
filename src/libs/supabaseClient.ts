import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client on the server side and uses Clerk's native integration to inject the user's access token into Supabase request
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    },
  );
}
