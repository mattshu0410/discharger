import { createServerSupabaseClient } from '@/libs/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const summary = formData.get('summary') as string || '';
    const tags = JSON.parse(formData.get('tags') as string || '[]') as string[];
    const shareStatus = formData.get('shareStatus') as string || 'private';
    const userId = formData.get('userId') as string || '00000000-0000-0000-0000-000000000000';

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const uploadedDocuments = [];

    for (const file of files) {
      // Generate document metadata
      const documentData = {
        user_id: userId,
        filename: file.name,
        summary: summary || `Uploaded document: ${file.name}`,
        source: 'user',
        share_status: shareStatus,
        uploaded_by: 'Current User', // TODO: Get from authenticated user
        s3_url: `https://temp-url/${file.name}`, // TODO: Implement actual file storage
        tags,
        metadata: {
          fileSize: file.size,
          fileType: file.type,
          originalName: file.name,
        },
      };

      // Save document metadata to database
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json({ error: 'Failed to save document metadata' }, { status: 500 });
      }

      uploadedDocuments.push(document);
    }

    // Process files for vector storage
    const processingFormData = new FormData();
    files.forEach((file) => {
      processingFormData.append('files', file);
    });

    // Call the pdfloader API for vector processing
    let vectorProcessed = false;
    let processingError = null;

    try {
      const processingResponse = await fetch(`${request.url.replace('/api/documents', '/api/pdfloader')}`, {
        method: 'POST',
        body: processingFormData,
      });

      if (processingResponse.ok) {
        vectorProcessed = true;
      } else {
        const errorText = await processingResponse.text();
        processingError = `Vector processing failed: ${processingResponse.status} ${errorText}`;
        console.error(processingError);
      }
    } catch (error) {
      processingError = `Vector processing error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(processingError);
    }

    return NextResponse.json({
      message: 'Documents uploaded successfully',
      documents: uploadedDocuments,
      vectorProcessed,
      processingError,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const ids = searchParams.get('ids');

    const supabase = createServerSupabaseClient();

    let dbQuery = supabase.from('documents').select('*');

    // If specific IDs are requested
    if (ids) {
      const documentIds = ids.split(',').filter(id => id.trim());
      dbQuery = dbQuery.in('id', documentIds);
    } else if (query) {
      // If there's a search query, filter by filename or summary
      dbQuery = dbQuery.or(`filename.ilike.%${query}%,summary.ilike.%${query}%`);
    }

    const { data, error } = await dbQuery
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
