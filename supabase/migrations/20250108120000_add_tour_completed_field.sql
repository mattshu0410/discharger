-- Add tour_completed field to profiles table
-- This separates profile onboarding from tour completion
-- Allows resetting tours without affecting profile completion status

ALTER TABLE profiles 
ADD COLUMN tour_completed BOOLEAN DEFAULT false;

-- Update existing users to have tour_completed = false so they see the tour
UPDATE profiles SET tour_completed = false WHERE tour_completed IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN profiles.tour_completed IS 'Whether user has completed the interactive tour (separate from profile onboarding)';