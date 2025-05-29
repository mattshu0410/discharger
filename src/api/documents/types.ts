import { Document, DocumentSearchResult } from '@/types';

// API Request Types
export interface UploadDocumentRequest {
  file: File;
  filename?: string;
  summary: string;
  tags: string[];
  shareStatus: 'private' | 'public';
}

export interface UpdateDocumentRequest {
  filename?: string;
  summary?: string;
  tags?: string[];
  shareStatus?: 'private' | 'public';
}

export interface SearchDocumentsRequest {
  query: string;
  source?: 'all' | 'user' | 'community';
  tags?: string[];
  limit?: number;
}

// API Response Types
export interface DocumentsResponse {
  documents: Document[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DocumentResponse {
  document: Document;
}

export interface UploadProgressResponse {
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
}

export interface DeleteDocumentResponse {
  success: boolean;
  id: string;
} 