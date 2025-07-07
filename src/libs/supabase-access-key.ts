import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

/**
 * Creates a custom JWT for access key authentication
 * Duration: 3 months (90 days)
 */
export function generateAccessKeyJWT(accessKey: string): string {
  ;

  const payload = {
    sub: 'access_key_user', // Special identifier for access key users
    role: 'anon',
    access_key: accessKey,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 90), // 3 months
  };

  ;

  const jwtSecret = process.env.SUPABASE_JWT_SECRET;
  if (!jwtSecret) {
    console.error('[DEBUG] SUPABASE_JWT_SECRET is missing');
    throw new Error('SUPABASE_JWT_SECRET environment variable is required');
  }

  ;

  try {
    const token = jwt.sign(payload, jwtSecret);
    ;
    return token;
  } catch (error) {
    console.error('[DEBUG] JWT generation error:', error);
    throw error;
  }
}

/**
 * Creates a Supabase client authenticated with an access key
 * This client will work with RLS policies that check for access keys
 */
export function createAccessKeySupabaseClient(accessKey: string) {
  ;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  ;
  ;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[DEBUG] Missing Supabase environment variables');
    throw new Error('Supabase environment variables are required');
  }

  try {
    const customJWT = generateAccessKeyJWT(accessKey);
    ;

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${customJWT}`,
        },
      },
    });

    ;
    return client;
  } catch (error) {
    console.error('[DEBUG] Error creating Supabase client:', error);
    throw error;
  }
}
