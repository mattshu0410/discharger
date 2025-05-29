import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { debounce } from '@/utils/debounce';
import { Document } from '@/types';

interface PatientState {
  // Current patient selection
  currentPatientId: number | null;
  
  // Temporary context for current patient (for auto-save and optimistic updates)
  currentPatientContext: string;
  
  // Track if context has been loaded from backend for current patient
  isContextLoadedFromBackend: boolean;
  
  // Selected documents for current patient
  selectedDocuments: Document[];
  
  // UI state
  isGenerating: boolean;
  
  // Actions
  setCurrentPatientId: (id: number | null) => void;
  updateCurrentPatientContext: (context: string) => void;
  loadContextFromBackend: (context: string) => void;
  setIsGenerating: (generating: boolean) => void;
  createNewPatient: () => void;
  addDocument: (document: Document) => void;
  removeDocument: (documentId: string) => void;
  clearDocuments: () => void;
}

// Debounced save function for auto-saving context
const debouncedSave = debounce((patientId: number, context: string) => {
  // This will be called by the API layer to save to server
  // Only save if there's actual content
  if (context.trim()) {
    console.log('Auto-saving context for patient:', patientId, context.slice(0, 50) + '...');
    // TODO: Implement actual API call to save context
  }
}, 1000);

const usePatientStore = create<PatientState>()(
  // persist is Zustand middleware that stores the state in localStorage saved to their device so if they reopen the browser, Zustand rehydrates the saved state from localStorage
  persist(
    // recall immutable means you have to make a copy of the object and modify that copy instead of changing the original object. To detect state change you need the original object reference. So you need states to be immutable. But immer makes it less verbose to write out immutable code e.g. instead of {...state, currentPatientId: 1} you can just state.currentPatientId = 1.
    immer((set, get) => ({
      // Initial state
      currentPatientId: null,
      currentPatientContext: '', // this is the context in the input field
      isContextLoadedFromBackend: false,
      selectedDocuments: [],
      isGenerating: false, // is discharge being generated basically
      
      // Actions
      setCurrentPatientId: (id) => set((state) => {
        // Auto-save previous patient's context before switching
        const previousId = state.currentPatientId;
        const previousContext = state.currentPatientContext;
        // Only save if there was actually a patient selected and something was typed in the context input field
        if (previousId && previousContext.trim() && previousId !== id) {
          debouncedSave(previousId, previousContext);
        }

        // Only reset context and flags if the patient ID actually changes
        if (previousId !== id) {
          state.currentPatientContext = ''; // Reset context, will be loaded from server
          state.isContextLoadedFromBackend = false; // Reset the loaded flag
          state.selectedDocuments = []; // Clear documents when switching patients
        }
        state.currentPatientId = id;
      }),
      
      updateCurrentPatientContext: (context) => set((state) => {
        state.currentPatientContext = context;
        
        // Trigger debounced auto-save if we have a current patient and content
        if (state.currentPatientId && context.trim()) {
          debouncedSave(state.currentPatientId, context);
        }
      }),
      
      // Loading context from backend
      loadContextFromBackend: (context) => set((state) => {
        // Only load if we haven't loaded from backend yet for this patient
        // This prevents overwriting user's edits
        if (!state.isContextLoadedFromBackend) {
          state.currentPatientContext = context;
          state.isContextLoadedFromBackend = true;
          console.log('Context loaded from backend for patient', state.currentPatientId);
        }
      }),
      
      setIsGenerating: (generating) => set((state) => {
        state.isGenerating = generating;
      }),

      createNewPatient: () => set((state) => {
        // Auto-save current patient's context before creating new patient
        const previousId = state.currentPatientId;
        const previousContext = state.currentPatientContext;
        if (previousId && previousContext.trim()) {
          debouncedSave(previousId, previousContext);
        }

        // Use negative ID for new patients to distinguish from existing ones
        state.currentPatientId = -Date.now(); // Unique negative ID
        state.currentPatientContext = '';
        state.isContextLoadedFromBackend = false;
        state.selectedDocuments = [];
      }),
      
      addDocument: (document) => set((state) => {
        // Don't add duplicates
        if (!state.selectedDocuments.find(d => d.id === document.id)) {
          state.selectedDocuments.push(document);
        }
      }),
      
      removeDocument: (documentId) => set((state) => {
        state.selectedDocuments = state.selectedDocuments.filter(d => d.id !== documentId);
      }),
      
      clearDocuments: () => set((state) => {
        state.selectedDocuments = [];
      }),
    })),
    {
      name: 'patient-storage',
      storage: createJSONStorage(() => localStorage),
      // Here you are telling Zustand hey, I only want the ID and context for the current patient to be persist which is useful for auto-recovery
      partialize: (state) => ({
        currentPatientId: state.currentPatientId,
        // Only persist current patient's context for auto-recovery
        currentPatientContext: state.currentPatientContext,
        // Also persist selected documents
        selectedDocuments: state.selectedDocuments,
      }),
    }
  )
);

export { usePatientStore };
