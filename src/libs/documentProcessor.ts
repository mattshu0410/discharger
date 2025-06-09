import type { Document } from 'langchain/document';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export type ProcessedDocument = {
  chunks: Document[];
  pageCount: number;
  chunkCount: number;
};

export async function processDocumentFile(
  file: File,
  documentId: string,
  userId: string,
): Promise<ProcessedDocument> {
  const fileExtension = file.name.toLowerCase().split('.').pop();
  // Convert File to Blob for LangChain loaders
  const fileBuffer = await file.arrayBuffer();
  const blob = new Blob([fileBuffer], { type: file.type });

  // Create appropriate loader based on file type
  let loader;
  switch (fileExtension) {
    case 'pdf':
      loader = new PDFLoader(blob);
      break;
    case 'docx':
      loader = new DocxLoader(blob);
      break;
    case 'doc':
      loader = new DocxLoader(blob);
      break;
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`);
  }

  // Load document pages
  const docs = await loader.load();
  console.warn(`Loaded ${docs.length} pages from ${file.name}`);

  // Split documents into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1024,
    chunkOverlap: 200,
  });

  const allSplits = await textSplitter.splitDocuments(docs);
  console.warn(`Split into ${allSplits.length} chunks`);

  // Add metadata to chunks linking them to the document
  const chunksWithMetadata = allSplits.map((split, index) => ({
    ...split,
    metadata: {
      ...split.metadata,
      document_id: documentId,
      user_id: userId,
      chunk_index: index,
      filename: file.name,
      page_number: split.metadata.page_number || split.metadata.loc?.pageNumber || 1,
    },
  }));

  return {
    chunks: chunksWithMetadata,
    pageCount: docs.length,
    chunkCount: allSplits.length,
  };
}
