import type { Citation, DischargeSummary, DischargeSummaryState, FeedbackItem } from '@/types/discharge';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const initialState = {
  currentSummary: null,
  isGenerating: false,
  lastGeneratedAt: null,
  error: null,
  feedbackHistory: [],
  pendingFeedback: '',
  isRegenerating: false,
  highlightedCitation: null,
  highlightedSection: null,
  suggestedRule: null,
};

export const useDischargeSummaryStore = create<DischargeSummaryState>()(
  devtools(
    set => ({
      ...initialState,

      setDischargeSummary: (summary: DischargeSummary) =>
        set(() => ({
          currentSummary: summary,
          lastGeneratedAt: new Date(),
          error: null,
        }), false, 'setDischargeSummary'),

      setIsGenerating: (isGenerating: boolean) =>
        set({ isGenerating }, false, 'setIsGenerating'),

      setIsRegenerating: (isRegenerating: boolean) =>
        set({ isRegenerating }, false, 'setIsRegenerating'),

      setError: (error: string | null) =>
        set({ error }, false, 'setError'),

      updatePendingFeedback: (feedback: string) =>
        set({ pendingFeedback: feedback }, false, 'updatePendingFeedback'),

      addFeedbackToHistory: (feedback: string) =>
        set(state => ({
          feedbackHistory: [
            ...state.feedbackHistory,
            {
              id: `feedback_${Date.now()}`,
              text: feedback,
              appliedAt: new Date(),
              resultedInRule: false,
            } as FeedbackItem,
          ],
          pendingFeedback: '',
        }), false, 'addFeedbackToHistory'),

      highlightCitation: (citation: Citation | null) => {
        console.warn('🔍 Store: Setting highlighted citation:', citation);
        if (citation && citation.sourceType !== 'user-context') {
          console.warn('📄 Document citation - documentId:', (citation as any).documentId);
        }
        set({ highlightedCitation: citation }, false, 'highlightCitation');
      },

      highlightSection: (sectionId: string | null) =>
        set({ highlightedSection: sectionId }, false, 'highlightSection'),

      clearSummary: () =>
        set({
          currentSummary: null,
          lastGeneratedAt: null,
          error: null,
          highlightedCitation: null,
          highlightedSection: null,
        }, false, 'clearSummary'),

      reset: () =>
        set(initialState, false, 'reset'),
    }),
    {
      name: 'discharge-summary-store',
    },
  ),
);
