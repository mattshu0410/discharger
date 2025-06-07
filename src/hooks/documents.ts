import type { Document, DocumentSearchResult } from '@/types';

// Get all documents for the current user
export async function getAllDocuments(_userId?: string): Promise<Document[]> {
  const response = await fetch('/api/documents');

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  return response.json();
}

// Search documents by query
export async function searchDocuments(query: string, _userId?: string): Promise<DocumentSearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  const response = await fetch(`/api/documents?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error('Failed to search documents');
  }

  const data = await response.json();

  // Transform the response to match DocumentSearchResult format
  return data.map((doc: Document) => ({
    document: doc,
    relevanceScore: 1,
    matchedText: `${doc.summary?.substring(0, 100)}...` || '',
  }));
}

// Get documents by IDs
export async function getDocumentsByIds(ids: string[]): Promise<Document[]> {
  if (ids.length === 0) {
    return [];
  }

  const response = await fetch(`/api/documents?ids=${ids.join(',')}`);

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  return response.json();
}

// Get a single document by ID
export async function getDocumentById(id: string): Promise<Document | null> {
  const response = await fetch(`/api/documents/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch document');
  }

  return response.json();
}
