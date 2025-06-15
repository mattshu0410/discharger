export type DischargeSummary = {
  id: string;
  patientId: string | null;
  sections: DischargeSection[];
  metadata: {
    generatedAt: Date;
    llmModel: string;
    documentIds: string[];
    feedbackApplied: string[];
  };
};

export type DischargeSection = {
  id: string;
  title: string;
  content: string;
  order: number;
  citations: Citation[];
  isEditable?: boolean;
};

export type ContextCitation = {
  id: string;
  context: string;
  relevanceScore: number;
  sourceType: 'user-context';
  contextSection?: string; // which part of user input
};

export type DocumentCitation = {
  id: string;
  context: string;
  relevanceScore: number;
  sourceType: 'selected-document' | 'retrieved-document';
  documentId: string;
  chunkId?: string;
  pageNumber?: number;
};

export type Citation = ContextCitation | DocumentCitation;

export type FeedbackItem = {
  id: string;
  text: string;
  appliedAt: Date;
  resultedInRule?: boolean;
};

export type Rule = {
  id: string;
  name: string;
  description: string;
  pattern: string;
  createdFrom?: string;
  isActive: boolean;
};

// API Types
export type GenerateDischargeSummaryRequest = {
  patientId: string | null;
  context: string;
  documentIds: string[];
  feedback?: string;
  currentSummary?: DischargeSummary; // Include current summary for regeneration
  rules?: string[];
};

export type GenerateDischargeSummaryResponse = {
  summary: DischargeSummary;
  retrievedDocuments?: string[]; // Additional documents found via RAG
};

// Store State Types
export type DischargeSummaryState = {
  // Core discharge data
  currentSummary: DischargeSummary | null;
  isGenerating: boolean;
  lastGeneratedAt: Date | null;
  error: string | null;

  // Feedback & regeneration
  feedbackHistory: FeedbackItem[];
  pendingFeedback: string;
  isRegenerating: boolean;

  // Citations & highlighting
  highlightedCitation: Citation | null;
  highlightedSection: string | null;

  // Rules (future)
  suggestedRule: Rule | null;

  // Actions
  setDischargeSummary: (summary: DischargeSummary) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIsRegenerating: (isRegenerating: boolean) => void;
  setError: (error: string | null) => void;
  updatePendingFeedback: (feedback: string) => void;
  addFeedbackToHistory: (feedback: string) => void;
  highlightCitation: (citation: Citation | null) => void;
  highlightSection: (sectionId: string | null) => void;
  clearSummary: () => void;
  reset: () => void;
};
