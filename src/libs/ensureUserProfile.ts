import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/libs/supabase-server';

/**
 * Ensures a user profile exists in Supabase after Clerk authentication.
 * Creates a new profile if one doesn't exist.
 * This should be called on protected routes to ensure proper user setup.
 */
export async function ensureUserProfile() {
  try {
    const user = await currentUser();
    if (!user) {
      return null;
    }

    const supabase = createServerSupabaseClient();

    // Check if profile already exists
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile && !selectError) {
      return existingProfile;
    }

    // Create new profile if it doesn't exist (404 means no profile found)
    if (selectError && selectError.code === 'PGRST116') {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          full_name: user.fullName || user.firstName,
          theme: 'system',
          default_document_ids: [],
          favorite_document_ids: [],
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Failed to create user profile:', insertError);
        throw insertError;
      }

      console.warn('✅ Created new user profile for:', user.id);
      return newProfile;
    }

    // If there was another error, throw it
    if (selectError) {
      console.error('❌ Failed to check user profile:', selectError);
      throw selectError;
    }

    return existingProfile;
  } catch (error) {
    console.error('❌ Failed to ensure user profile:', error);
    throw error;
  }
}
