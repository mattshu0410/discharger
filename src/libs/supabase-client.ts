import { useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client with Clerk auth integration
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!,
);

// Hook to create authenticated Supabase client on client-side
export function useSupabaseClient() {
  const { session } = useSession();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      accessToken: async () => {
        try {
          return session?.getToken() ?? null;
        } catch (error) {
          console.error('Error getting Clerk token:', error);
          return null;
        }
      },
    },
  );
}
