import { createServerSupabaseClient } from '@/libs/supabase-server';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

    // First, get the document metadata to extract the file path
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('metadata, s3_url')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Extract file path from metadata or s3_url
    let filePath: string | null = null;

    if (document.metadata?.storageKey) {
      filePath = document.metadata.storageKey;
    } else if (document.s3_url) {
      // Extract path from public URL
      const url = new URL(document.s3_url);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/documents\/(.+)$/);
      if (pathMatch && pathMatch[1]) {
        filePath = pathMatch[1];
      }
    }

    if (!filePath) {
      return NextResponse.json({
        error: 'Could not determine file path for document',
      }, { status: 400 });
    }

    // Generate signed URL (1 hour expiry)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600);

    if (urlError || !signedUrlData) {
      console.error('Error generating signed URL:', urlError);
      return NextResponse.json({
        error: 'Failed to generate signed URL',
      }, { status: 500 });
    }

    return NextResponse.json({
      signedUrl: signedUrlData.signedUrl,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
