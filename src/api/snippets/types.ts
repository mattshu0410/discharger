import type { Snippet } from '@/types';

// API Request Types
export type CreateSnippetRequest = {
  shortcut: string;
  content: string;
};

export type UpdateSnippetRequest = {
  shortcut?: string;
  content?: string;
};

// API Response Types
export type SnippetsResponse = {
  snippets: Snippet[];
  total: number;
};

export type SnippetResponse = {
  snippet: Snippet;
};

export type DeleteSnippetResponse = {
  success: boolean;
  id: string;
};
