import type { Document } from '@/types';

// API Request Types
export type UploadDocumentRequest = {
  file: File;
  filename?: string;
  summary: string;
  tags: string[];
  shareStatus: 'private' | 'public';
};

export type UpdateDocumentRequest = {
  filename?: string;
  summary?: string;
  tags?: string[];
  shareStatus?: 'private' | 'public';
};

export type SearchDocumentsRequest = {
  query: string;
  source?: 'all' | 'user' | 'community';
  tags?: string[];
  limit?: number;
};

// API Response Types
export type DocumentsResponse = {
  documents: Document[];
  total: number;
  page: number;
  pageSize: number;
};

export type DocumentResponse = {
  document: Document;
};

export type UploadProgressResponse = {
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
};

export type DeleteDocumentResponse = {
  success: boolean;
  id: string;
};
