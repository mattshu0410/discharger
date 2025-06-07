import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type UIState = {
  // Sidebar state
  isSidebarOpen: boolean;
  activeView: 'patients' | 'settings';
  // Settings tabs
  activeSettingsTab: 'memory' | 'snippets' | 'profile';
  // Panels state
  isContextViewerOpen: boolean;
  contextViewerHeight: number;
  // Modal states
  isUploadModalOpen: boolean;
  isPatientModalOpen: boolean;
  isSnippetModalOpen: boolean;
  // Document selector state
  isDocumentSelectorOpen: boolean;
  documentSelectorPosition: { x: number; y: number } | null;
  documentSearchQuery: string;
  // Snippet selector state
  isSnippetSelectorOpen: boolean;
  snippetSelectorPosition: { x: number; y: number } | null;
  snippetSearchQuery: string;
  // Highlighted citation
  highlightedCitationId: string | null;
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: UIState['activeView']) => void;
  setActiveSettingsTab: (tab: UIState['activeSettingsTab']) => void;
  toggleContextViewer: () => void;
  setContextViewerOpen: (open: boolean) => void;
  setContextViewerHeight: (height: number) => void;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  openPatientModal: () => void;
  closePatientModal: () => void;
  openSnippetModal: () => void;
  closeSnippetModal: () => void;
  openDocumentSelector: (position: { x: number; y: number }) => void;
  closeDocumentSelector: () => void;
  setDocumentSearchQuery: (query: string) => void;
  openSnippetSelector: (position: { x: number; y: number }) => void;
  closeSnippetSelector: () => void;
  setSnippetSearchQuery: (query: string) => void;
  setHighlightedCitation: (citationId: string | null) => void;
};

export const useUIStore = create<UIState>()(
  immer(set => ({
    // Initial state
    isSidebarOpen: true,
    activeView: 'patients',
    activeSettingsTab: 'memory',
    isContextViewerOpen: false,
    contextViewerHeight: 200,
    isUploadModalOpen: false,
    isPatientModalOpen: false,
    isSnippetModalOpen: false,
    isDocumentSelectorOpen: false,
    documentSelectorPosition: null,
    documentSearchQuery: '',
    isSnippetSelectorOpen: false,
    snippetSelectorPosition: null,
    snippetSearchQuery: '',
    highlightedCitationId: null,
    // Actions
    toggleSidebar: () => set((state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    }),
    setSidebarOpen: open => set((state) => {
      state.isSidebarOpen = open;
    }),
    setActiveView: view => set((state) => {
      state.activeView = view;
    }),
    setActiveSettingsTab: tab => set((state) => {
      state.activeSettingsTab = tab;
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

    setHighlightedCitation: citationId => set((state) => {
      state.highlightedCitationId = citationId;
    }),
  })),
);
