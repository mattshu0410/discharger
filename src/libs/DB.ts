// This application uses Supabase for data persistence
// All database operations should use the Supabase client instead of this file
// This file is kept for any legacy compatibility but should not be used

import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from '@/models/Schema';
import { Env } from './Env';

// Simplified DB setup - only for legacy compatibility
// New code should use Supabase client from @/libs/supabase-server.ts or @/libs/supabase-client.ts
let db: ReturnType<typeof drizzle>;

if (Env.DATABASE_URL) {
  const client = new Client({
    connectionString: Env.DATABASE_URL,
  });

  // Note: Not connecting here to avoid build-time connection issues
  // This should only be used if absolutely necessary for legacy code
  db = drizzle(client, { schema });
} else {
  // Throw error if DATABASE_URL is not available
  throw new Error('DATABASE_URL is required but not provided. Please use Supabase client instead.');
}

export { db };
