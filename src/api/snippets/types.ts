import { Snippet } from '@/types';

// API Request Types
export interface CreateSnippetRequest {
  shortcut: string;
  content: string;
}

export interface UpdateSnippetRequest {
  shortcut?: string;
  content?: string;
}

// API Response Types
export interface SnippetsResponse {
  snippets: Snippet[];
  total: number;
}

export interface SnippetResponse {
  snippet: Snippet;
}

export interface DeleteSnippetResponse {
  success: boolean;
  id: string;
} 