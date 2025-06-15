import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { processDocumentFile } from '@/libs/documentProcessor';
import { createServerSupabaseClient } from '@/libs/supabase-server';
import { getUserVectorStore } from '@/libs/vectorStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const summary = formData.get('summary') as string || '';
    const tags = JSON.parse(formData.get('tags') as string || '[]') as string[];
    const shareStatus = formData.get('shareStatus') as string || 'private';

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    // Check file sizes
    const MAX_FILE_SIZE = 45 * 1024 * 1024; // 45MB
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          error: `File "${file.name}" is too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum size is 45MB.`,
        }, { status: 413 });
      }
    }

    const supabase = createServerSupabaseClient();
    const uploadedDocuments = [];
    const vectorStore = await getUserVectorStore(user.id);

    // Debug: Check if Supabase can see the authenticated user
    console.warn('Clerk user ID:', user.id);

    // Process each file atomically
    for (const file of files) {
      try {
        // Step 1: Upload file to Supabase Storage (user context from JWT)
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const fileBuffer = await file.arrayBuffer();

        const { error: storageError } = await supabase.storage
          .from('documents')
          .upload(fileName, fileBuffer, {
            contentType: file.type,
            upsert: false,
            metadata: {
              originalName: file.name,
            },
          });

        if (storageError) {
          throw new Error(`Failed to upload file: ${storageError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        // Step 2: Create document metadata
        const documentData = {
          user_id: user.id, // Clerk ID - must match JWT sub claim
          filename: file.name,
          summary: summary || `Uploaded document: ${file.name}`,
          source: 'user',
          share_status: shareStatus,
          uploaded_by: user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.primaryEmailAddress?.emailAddress || 'Current User',
          s3_url: publicUrl,
          tags,
          metadata: {
            fileSize: file.size,
            fileType: file.type,
            originalName: file.name,
            storageKey: fileName,
          },
        };

        const { data: document, error: dbError } = await supabase
          .from('documents')
          .insert(documentData)
          .select()
          .single();

        if (dbError) {
          // Rollback: Delete uploaded file
          await supabase.storage.from('documents').remove([fileName]);
          throw new Error(`Failed to save document metadata: ${dbError.message}`);
        }

        // Step 3: Process document with LangChain and store vectors
        try {
          const processedDoc = await processDocumentFile(file, document.id, user.id);

          // Update the document with full text
          const { error: updateError } = await supabase
            .from('documents')
            .update({ full_text: processedDoc.fullText })
            .eq('id', document.id);

          if (updateError) {
            throw new Error(`Failed to update document with full text: ${updateError.message}`);
          }

          // Add documents to vector store and get the inserted IDs
          const vectorIds = await vectorStore.addDocuments(processedDoc.chunks);

          // Update the custom columns for each inserted vector
          for (let i = 0; i < vectorIds.length; i++) {
            const vectorId = vectorIds[i];
            const chunk = processedDoc.chunks[i];

            if (chunk) {
              await supabase
                .from('document_vecs')
                .update({
                  document_id: chunk.metadata.document_id,
                  page_number: chunk.metadata.page_number || 1,
                  chunk_index: chunk.metadata.chunk_index || 0,
                })
                .eq('id', vectorId);
            }
          }
        } catch (vectorError) {
          // Rollback: Delete file and document record
          await supabase.storage.from('documents').remove([fileName]);
          await supabase.from('documents').delete().eq('id', document.id);
          throw new Error(`Failed to process document: ${vectorError instanceof Error ? vectorError.message : 'Unknown error'}`);
        }

        uploadedDocuments.push(document);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);

        return NextResponse.json({
          error: `Failed to process file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          partialSuccess: uploadedDocuments.length > 0,
          successfulDocuments: uploadedDocuments,
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: 'Documents uploaded and processed successfully',
      documents: uploadedDocuments,
      vectorProcessed: true,
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
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const ids = searchParams.get('ids');

    const supabase = createServerSupabaseClient();

    let dbQuery = supabase.from('documents').select('*');

    // RLS policies will automatically filter by user's documents + public documents
    // No need for manual user filtering

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

    // Transform the response to match frontend expectations (camelCase)
    const transformedData = (data || []).map(doc => ({
      ...doc,
      shareStatus: doc.share_status,
      uploadedAt: doc.uploaded_at,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      userId: doc.user_id,
      uploadedBy: doc.uploaded_by,
      s3Url: doc.s3_url,
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
