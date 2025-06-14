-- Add preference columns to existing profiles table
-- This migration extends the existing profiles table with user preferences

-- Create theme enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE theme AS ENUM ('light', 'dark', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization text,
ADD COLUMN IF NOT EXISTS role text,
ADD COLUMN IF NOT EXISTS theme theme DEFAULT 'system',
ADD COLUMN IF NOT EXISTS default_document_ids jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS favorite_document_ids jsonb DEFAULT '[]'::jsonb;

-- Update the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();