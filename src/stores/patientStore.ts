import type { Document } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { debounce } from '@/utils/debounce';

// Configuration for autosave behavior
const AUTOSAVE_DEBOUNCE_DELAY = 2000; // 2 seconds - adjust this to make autosave faster/slower

// Store a reference to the auto-save function that will be set from the component
let autoSaveFunction: ((patientId: string, context: string, patientName?: string) => Promise<void>) | null = null;

export function setAutoSaveFunction(fn: (patientId: string, context: string, patientName?: string) => Promise<void>) {
  autoSaveFunction = fn;
}

// Create a single debounced save function that persists
const debouncedSave = debounce(async (patientId: string, context: string, patientName?: string) => {
  if (context.trim() && autoSaveFunction) {
    try {
      await autoSaveFunction(patientId, context, patientName);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }
}, AUTOSAVE_DEBOUNCE_DELAY);

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type PatientState = {
  // Current patient selection
  currentPatientId: string | null;

  // Temporary context for current patient (for auto-save and optimistic updates)
  currentPatientContext: string;

  // Track if context has been loaded from backend for current patient
  isContextLoadedFromBackend: boolean;

  // Selected documents for current patient
  selectedDocuments: Document[];

  // UI state
  isGenerating: boolean;

  // Autosave status tracking
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  saveError: string | null;

  // Track pending patient creation
  pendingPatientCreation: string | null; // ID of patient being created
  creationPromise: Promise<any> | null; // Promise tracking the creation

  // Actions
  setCurrentPatientId: (id: string | null) => void;
  updateCurrentPatientContext: (context: string) => void;
  loadContextFromBackend: (context: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setPendingPatientCreation: (id: string | null, promise: Promise<any> | null) => void;
  addDocument: (document: Document) => void;
  removeDocument: (documentId: string) => void;
  clearDocuments: () => void;
  addDocumentsFromGeneration: (documents: Document[]) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setSaveError: (error: string | null) => void;
  setLastSaved: (date: Date | null) => void;
};

export const usePatientStore = create<PatientState>()(
  // persist is Zustand middleware that stores the state in localStorage saved to their device so if they reopen the browser, Zustand rehydrates the saved state from localStorage
  persist(
    // recall immutable means you have to make a copy of the object and modify that copy instead of changing the original object. To detect state change you need the original object reference. So you need states to be immutable. But immer makes it less verbose to write out immutable code e.g. instead of {...state, currentPatientId: 1} you can just state.currentPatientId = 1.
    immer(set => ({
      // Initial state
      currentPatientId: null,
      currentPatientContext: '', // this is the context in the input field
      isContextLoadedFromBackend: false,
      selectedDocuments: [],
      isGenerating: false, // is discharge being generated basically
      saveStatus: 'idle' as SaveStatus,
      lastSaved: null,
      saveError: null,
      pendingPatientCreation: null,
      creationPromise: null,

      // Actions
      setCurrentPatientId: (id) => {
        const pendingCreation = usePatientStore.getState().pendingPatientCreation;
        const creationPromise = usePatientStore.getState().creationPromise;

        // If there's a pending patient creation and we're switching to a different patient, wait for it
        if (pendingCreation && pendingCreation !== id && creationPromise) {
          creationPromise.then(() => {
            // After creation completes, proceed with the switch
            set((state) => {
              const previousId = state.currentPatientId;

              // Only reset context and flags if the patient ID actually changes
              if (previousId !== id) {
                state.currentPatientContext = ''; // Reset context, will be loaded from server
                state.isContextLoadedFromBackend = false; // Reset the loaded flag
                state.selectedDocuments = []; // Clear documents when switching patients
                state.saveStatus = 'idle'; // Reset save status
                state.saveError = null; // Clear any previous errors
              }
              state.currentPatientId = id;
            });
          }).catch((error) => {
            console.error('Patient creation failed while switching:', error);
            // Still proceed with the switch even if creation failed
            set((state) => {
              const previousId = state.currentPatientId;

              if (previousId !== id) {
                state.currentPatientContext = '';
                state.isContextLoadedFromBackend = false;
                state.selectedDocuments = [];
                state.saveStatus = 'idle';
                state.saveError = null;
              }
              state.currentPatientId = id;
            });
          });
        } else {
          // No pending creation, proceed normally
          set((state) => {
            const previousId = state.currentPatientId;

            // Only reset context and flags if the patient ID actually changes
            if (previousId !== id) {
              state.currentPatientContext = ''; // Reset context, will be loaded from server
              state.isContextLoadedFromBackend = false; // Reset the loaded flag
              state.selectedDocuments = []; // Clear documents when switching patients
              state.saveStatus = 'idle'; // Reset save status
              state.saveError = null; // Clear any previous errors
            }
            state.currentPatientId = id;
          });
        }
      },

      updateCurrentPatientContext: context => set((state) => {
        state.currentPatientContext = context;

        // Trigger debounced auto-save if we have a current patient and content
        if (state.currentPatientId && context.trim()) {
          debouncedSave(state.currentPatientId, context);
        }
      }),

      // Loading context from backend
      loadContextFromBackend: context => set((state) => {
        // Only load if we haven't loaded from backend yet for this patient
        // This prevents overwriting user's edits
        if (!state.isContextLoadedFromBackend) {
          state.currentPatientContext = context;
          state.isContextLoadedFromBackend = true;
          // console.warn('Context loaded from backend for patient', state.currentPatientId);
        }
      }),

      setIsGenerating: generating => set((state) => {
        state.isGenerating = generating;
      }),

      setPendingPatientCreation: (id, promise) => set((state) => {
        state.pendingPatientCreation = id;
        state.creationPromise = promise;
      }),

      addDocument: document => set((state) => {
        // Don't add duplicates
        if (!state.selectedDocuments.find((d: Document) => d.id === document.id)) {
          state.selectedDocuments.push(document);
        }
      }),

      removeDocument: documentId => set((state) => {
        state.selectedDocuments = state.selectedDocuments.filter((d: Document) => d.id !== documentId);
      }),

      clearDocuments: () => set((state) => {
        state.selectedDocuments = [];
      }),

      addDocumentsFromGeneration: documents => set((state) => {
        // Add all documents from generation (user-selected + RAG-retrieved)
        // without duplicates
        documents.forEach((document) => {
          if (!state.selectedDocuments.find((d: Document) => d.id === document.id)) {
            state.selectedDocuments.push(document);
          }
        });
        // console.warn(`Added ${documents.length} documents from generation, total: ${state.selectedDocuments.length}`);
      }),

      setSaveStatus: status => set((state) => {
        state.saveStatus = status;
      }),

      setSaveError: error => set((state) => {
        state.saveError = error;
      }),

      setLastSaved: date => set((state) => {
        state.lastSaved = date;
      }),
    })),
    {
      name: 'patient-storage',
      storage: createJSONStorage(() => localStorage),
      // Here you are telling Zustand hey, I only want the ID and context for the current patient to be persist which is useful for auto-recovery
      partialize: state => ({
        currentPatientId: state.currentPatientId,
        // Only persist current patient's context for auto-recovery
        currentPatientContext: state.currentPatientContext,
        // Also persist selected documents
        selectedDocuments: state.selectedDocuments,
      }),
    },
  ),
);
