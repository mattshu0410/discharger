import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/libs/supabase-server';

// PUT /api/users/preferences - Update user preferences
export async function PUT(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const supabase = createServerSupabaseClient();

    // Update preferences
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.theme !== undefined) {
      updateData.theme = data.theme;
    }
    if (data.defaultDocumentIds !== undefined) {
      updateData.default_document_ids = data.defaultDocumentIds;
    }
    if (data.favoriteDocumentIds !== undefined) {
      updateData.favorite_document_ids = data.favoriteDocumentIds;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update user preferences:', updateError);
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
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
      preferences: {
        defaultDocumentIds: updatedProfile.default_document_ids || [],
        favoriteDocumentIds: updatedProfile.favorite_document_ids || [],
        theme: updatedProfile.theme || 'system',
      },
    });
  } catch (error) {
    console.error('Failed to update user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 },
    );
  }
}
