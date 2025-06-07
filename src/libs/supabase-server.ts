import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client with Clerk auth
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    // Temporarily removing Clerk auth to test basic Supabase connection
    // process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    // {
    //  async accessToken() {
    //    return (await auth()).getToken();
    //  },
    // },
    // We'll re-add this once the basic functionality is working
  );
}
