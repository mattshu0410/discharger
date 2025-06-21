// Core Types for Discharger Application
import type { DischargeSummary } from './discharge';

export type Patient = {
  id: string;
  user_id: string; // Maps to user_id in database (Clerk user ID)
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  context?: string; // Optional in database
  discharge_text?: string; // Optional in database
  document_ids: string[]; // Maps to document_ids jsonb in database
  created_at: Date; // Maps to created_at in database
  updated_at: Date; // Maps to updated_at in database
  // Computed fields (not in database)
  dischargeSummary?: DischargeSummary;
};

export type Document = {
  id: string;
  userId?: string; // Optional for community documents
  filename: string;
  summary: string;
  source: 'user' | 'community';
  shareStatus: 'private' | 'public';
  uploadedBy: string;
  uploadedAt: Date;
  s3Url: string;
  metadata?: Record<string, any>;
  tags: string[];
  full_text?: string; // Full text content of the document
};

export type DocumentChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  textChunk: string;
  pageNumber: number;
  embedding: number[];
  metadata?: Record<string, any>;
};

export type Snippet = {
  id: string;
  userId: string;
  shortcut: string; // e.g., "orthonote"
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

// DischargeSummary type moved to types/discharge.ts

// DischargeSection type moved to types/discharge.ts

// Citation type moved to types/discharge.ts

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  organization?: string;
  role?: string;
  title?: string;
  department?: string;
  hospitalId?: string;
  onboarding_completed?: boolean;
  preferences: UserPreferences;
};

export type UserPreferences = {
  defaultDocumentIds: string[];
  favoriteDocumentIds: string[];
  theme: 'light' | 'dark' | 'system';
};

// UI State Types
export type DocumentSearchResult = {
  document: Document;
  relevanceScore: number;
  matchedText?: string;
};

export type SnippetSearchResult = {
  snippet: Snippet;
  relevanceScore: number;
  matchedText?: string;
};

export type GenerateDischargeRequest = {
  patientId: string;
  context: string;
  documentIds: string[];
  snippetIds: string[];
};

export type GenerateDischargeResponse = {
  summary: DischargeSummary;
  usedDocuments: Document[];
  processingTime: number;
};
