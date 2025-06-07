import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (no auth integration needed since we'll use API routes)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!,
);
