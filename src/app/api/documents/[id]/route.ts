import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerSupabaseClient();

    // First, get the document to retrieve the file path (user filtering handled by RLS)
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('s3_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Delete the file from storage if it exists
    if (document.s3_url && document.s3_url.includes('/documents/')) {
      const filePath = document.s3_url.split('/documents/')[1];
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete the document record from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err },
      { status: 500 },
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = createServerSupabaseClient();

    // Update document (RLS will ensure user can only update their own documents)
    const { data, error } = await supabase
      .from('documents')
      .update({
        summary: body.summary,
        tags: body.tags,
        share_status: body.shareStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the response to match frontend expectations (camelCase)
    const transformedData = {
      ...data,
      shareStatus: data.share_status,
      uploadedAt: data.uploaded_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.user_id,
      uploadedBy: data.uploaded_by,
      s3Url: data.s3_url,
    };

    return NextResponse.json(transformedData);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err },
      { status: 500 },
    );
  }
}
