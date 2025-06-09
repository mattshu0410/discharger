import type { memoryFile } from '@/types/files';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type BracketPosition = {
  start: number;
  end: number;
  content: string;
};

type UIState = {
  // Sidebar state
  isSidebarOpen: boolean;
  // NOTE: Removed activeView and activeSettingsTab - these are now derived from URL
  // Panels state
  isContextViewerOpen: boolean;
  contextViewerHeight: number;
  // Modal states
  isUploadModalOpen: boolean;
  isPatientModalOpen: boolean;
  isSnippetModalOpen: boolean;
  isDocumentPreviewOpen: boolean;
  previewDocument: memoryFile | null;
  // Document selector state
  isDocumentSelectorOpen: boolean;
  documentSelectorPosition: { x: number; y: number } | null;
  documentSearchQuery: string;
  // Snippet selector state
  isSnippetSelectorOpen: boolean;
  snippetSelectorPosition: { x: number; y: number } | null;
  snippetSearchQuery: string;
  // Memory page search
  memorySearchQuery: string;
  // Highlighted citation
  highlightedCitationId: string | null;
  // Bracket navigation state
  bracketPositions: BracketPosition[];
  currentBracketIndex: number;
  isBracketNavigationActive: boolean;
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  // NOTE: Removed setActiveView and setActiveSettingsTab - navigation is now URL-driven
  toggleContextViewer: () => void;
  setContextViewerOpen: (open: boolean) => void;
  setContextViewerHeight: (height: number) => void;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  openPatientModal: () => void;
  closePatientModal: () => void;
  openSnippetModal: () => void;
  closeSnippetModal: () => void;
  openDocumentPreview: (document: memoryFile) => void;
  closeDocumentPreview: () => void;
  openDocumentSelector: (position: { x: number; y: number }) => void;
  closeDocumentSelector: () => void;
  setDocumentSearchQuery: (query: string) => void;
  openSnippetSelector: (position: { x: number; y: number }) => void;
  closeSnippetSelector: () => void;
  setSnippetSearchQuery: (query: string) => void;
  setMemorySearchQuery: (query: string) => void;
  setHighlightedCitation: (citationId: string | null) => void;
  // Bracket navigation actions
  initializeBrackets: (textareaElement: HTMLTextAreaElement, insertedText: string, insertPosition: number) => void;
  updateBracketPositions: (textareaElement: HTMLTextAreaElement) => void;
  clearBrackets: () => void;
  handleTabNavigation: (event: React.KeyboardEvent<HTMLTextAreaElement>, textareaElement: HTMLTextAreaElement) => boolean;
};

export const useUIStore = create<UIState>()(
  immer(set => ({
    // Initial state
    isSidebarOpen: true,
    isContextViewerOpen: false,
    contextViewerHeight: 200,
    isUploadModalOpen: false,
    isPatientModalOpen: false,
    isSnippetModalOpen: false,
    isDocumentPreviewOpen: false,
    previewDocument: null,
    isDocumentSelectorOpen: false,
    documentSelectorPosition: null,
    documentSearchQuery: '',
    isSnippetSelectorOpen: false,
    snippetSelectorPosition: null,
    snippetSearchQuery: '',
    memorySearchQuery: '',
    highlightedCitationId: null,
    // Bracket navigation initial state
    bracketPositions: [],
    currentBracketIndex: -1,
    isBracketNavigationActive: false,
    // Actions
    toggleSidebar: () => set((state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    }),
    setSidebarOpen: open => set((state) => {
      state.isSidebarOpen = open;
    }),
    toggleContextViewer: () => set((state) => {
      state.isContextViewerOpen = !state.isContextViewerOpen;
    }),
    setContextViewerOpen: open => set((state) => {
      state.isContextViewerOpen = open;
    }),
    setContextViewerHeight: height => set((state) => {
      state.contextViewerHeight = height;
    }),
    openUploadModal: () => set((state) => {
      state.isUploadModalOpen = true;
    }),
    closeUploadModal: () => set((state) => {
      state.isUploadModalOpen = false;
    }),

    openPatientModal: () => set((state) => {
      state.isPatientModalOpen = true;
    }),

    closePatientModal: () => set((state) => {
      state.isPatientModalOpen = false;
    }),

    openSnippetModal: () => set((state) => {
      state.isSnippetModalOpen = true;
    }),

    closeSnippetModal: () => set((state) => {
      state.isSnippetModalOpen = false;
    }),

    openDocumentPreview: document => set((state) => {
      state.isDocumentPreviewOpen = true;
      state.previewDocument = document;
    }),

    closeDocumentPreview: () => set((state) => {
      state.isDocumentPreviewOpen = false;
      state.previewDocument = null;
    }),

    openDocumentSelector: position => set((state) => {
      state.isDocumentSelectorOpen = true;
      state.documentSelectorPosition = position;
      state.documentSearchQuery = '';
    }),

    closeDocumentSelector: () => set((state) => {
      state.isDocumentSelectorOpen = false;
      state.documentSelectorPosition = null;
      state.documentSearchQuery = '';
    }),

    setDocumentSearchQuery: query => set((state) => {
      state.documentSearchQuery = query;
    }),

    openSnippetSelector: position => set((state) => {
      state.isSnippetSelectorOpen = true;
      state.snippetSelectorPosition = position;
      state.snippetSearchQuery = '';
    }),

    closeSnippetSelector: () => set((state) => {
      state.isSnippetSelectorOpen = false;
      state.snippetSelectorPosition = null;
      state.snippetSearchQuery = '';
    }),

    setSnippetSearchQuery: query => set((state) => {
      state.snippetSearchQuery = query;
    }),

    setMemorySearchQuery: query => set((state) => {
      state.memorySearchQuery = query;
    }),

    setHighlightedCitation: citationId => set((state) => {
      state.highlightedCitationId = citationId;
    }),

    // Bracket navigation actions
    initializeBrackets: (textareaElement, _insertedText, _insertPosition) => {
      set((state) => {
        state.isBracketNavigationActive = true;
        state.currentBracketIndex = 0;
      });

      // Update positions from current textarea content
      useUIStore.getState().updateBracketPositions(textareaElement);

      // Select the first bracket
      const positions = useUIStore.getState().bracketPositions;
      if (positions.length > 0) {
        const firstBracket = positions[0];
        if (firstBracket) {
          setTimeout(() => {
            textareaElement.focus();
            textareaElement.setSelectionRange(firstBracket.start, firstBracket.end);
          }, 0);
        }
      }
    },

    updateBracketPositions: (textareaElement) => {
      const text = textareaElement.value;
      const bracketRegex = /\[([^\]]+)\]/g;
      const positions: BracketPosition[] = [];
      const matches = [...text.matchAll(bracketRegex)];
      for (const match of matches) {
        positions.push({
          start: match.index || 0,
          end: (match.index || 0) + match[0].length,
          content: match[1] || '',
        });
      }

      set((state) => {
        const previousCount = state.bracketPositions.length;
        const newCount = positions.length;

        state.bracketPositions = positions;

        // If brackets were consumed (count decreased), adjust the index
        if (newCount < previousCount && newCount > 0) {
          // Set to -1 so that the next tab increment lands on index 0 (first remaining bracket)
          state.currentBracketIndex = -1;
        } else if (state.currentBracketIndex >= positions.length) {
          // If current index is out of bounds, reset to first bracket
          state.currentBracketIndex = positions.length > 0 ? 0 : -1;
        }

        // Deactivate if no brackets left
        if (positions.length === 0) {
          state.isBracketNavigationActive = false;
          state.currentBracketIndex = -1;
        }
      });
    },

    clearBrackets: () => set((state) => {
      state.bracketPositions = [];
      state.currentBracketIndex = -1;
      state.isBracketNavigationActive = false;
    }),

    handleTabNavigation: (event, textareaElement) => {
      const state = useUIStore.getState();

      if (event.key !== 'Tab' || !state.isBracketNavigationActive) {
        return false;
      }

      event.preventDefault();

      // Update bracket positions first (in case text changed)
      state.updateBracketPositions(textareaElement);

      // Get updated state
      const updatedState = useUIStore.getState();
      if (updatedState.bracketPositions.length === 0) {
        return false;
      }

      // Calculate next/previous index
      const currentIndex = updatedState.currentBracketIndex;
      const totalBrackets = updatedState.bracketPositions.length;
      const nextIndex = event.shiftKey
        ? (currentIndex - 1 + totalBrackets) % totalBrackets
        : (currentIndex + 1) % totalBrackets;

      const bracket = updatedState.bracketPositions[nextIndex];

      if (bracket && textareaElement) {
        // Update the current index
        set((draft) => {
          draft.currentBracketIndex = nextIndex;
        });

        // Focus and select the bracket
        textareaElement.focus();
        textareaElement.setSelectionRange(bracket.start, bracket.end);
      }

      return true;
    },
  })),
);
