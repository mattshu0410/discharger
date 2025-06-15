import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/libs/supabase-server';

// GET /api/users/profile - Get current user profile
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    // Get or create user profile
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile && !selectError) {
      // Return existing profile with Clerk data
      return NextResponse.json({
        id: existingProfile.id,
        email: user.primaryEmailAddress?.emailAddress || existingProfile.email,
        name: existingProfile.full_name || user.fullName || user.firstName,
        organization: existingProfile.organization,
        role: existingProfile.role,
        title: existingProfile.title,
        department: existingProfile.department,
        hospitalId: existingProfile.hospital_id,
        preferences: {
          defaultDocumentIds: existingProfile.default_document_ids || [],
          favoriteDocumentIds: existingProfile.favorite_document_ids || [],
          theme: existingProfile.theme || 'system',
        },
      });
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
        console.error('Failed to create user profile:', insertError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 },
        );
      }

      return NextResponse.json({
        id: newProfile.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: newProfile.full_name,
        organization: newProfile.organization,
        role: newProfile.role,
        title: newProfile.title,
        department: newProfile.department,
        hospitalId: newProfile.hospital_id,
        preferences: {
          defaultDocumentIds: newProfile.default_document_ids || [],
          favoriteDocumentIds: newProfile.favorite_document_ids || [],
          theme: newProfile.theme || 'system',
        },
      });
    }

    // If there was another error, throw it
    if (selectError) {
      console.error('Failed to get user profile:', selectError);
      return NextResponse.json(
        { error: 'Failed to get user profile' },
        { status: 500 },
      );
    }

    // This should never be reached but TypeScript requires a return
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return NextResponse.json(
      { error: 'Failed to get user profile' },
      { status: 500 },
    );
  }
}

// PUT /api/users/profile - Update user profile
export async function PUT(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const supabase = createServerSupabaseClient();

    // Update profile
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (data.name !== undefined) {
      updateData.full_name = data.name;
    }
    if (data.organization !== undefined) {
      updateData.organization = data.organization;
    }
    if (data.role !== undefined) {
      updateData.role = data.role;
    }
    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.department !== undefined) {
      updateData.department = data.department;
    }
    if (data.hospitalId !== undefined) {
      updateData.hospital_id = data.hospitalId;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update user profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    if (!updatedProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: updatedProfile.id,
      email: user.primaryEmailAddress?.emailAddress || updatedProfile.email,
      name: updatedProfile.full_name,
      organization: updatedProfile.organization,
      role: updatedProfile.role,
      title: updatedProfile.title,
      department: updatedProfile.department,
      hospitalId: updatedProfile.hospital_id,
      preferences: {
        defaultDocumentIds: updatedProfile.default_document_ids || [],
        favoriteDocumentIds: updatedProfile.favorite_document_ids || [],
        theme: updatedProfile.theme || 'system',
      },
    });
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 },
    );
  }
}
