import type { Patient } from '@/types/patient';
import { create } from 'zustand';

type PatientStore = {
  currentPatientId: number | null;
  editedPatient: Patient | null;
  setCurrentPatientId: (id: number | null) => void;
  setEditedPatient: (patient: Patient) => void;
  updateEditedField: (field: keyof Patient, value: any) => void;
};

const usePatientStore = create<PatientStore>(set => ({
  currentPatientId: null,
  editedPatient: null,
  setCurrentPatientId: id => set({ currentPatientId: id }),
  setEditedPatient: (patient: Patient | null): void => {
    set({ editedPatient: patient });
    console.warn('Current patient set to:', patient);
  },
  updateEditedField: (key, value) =>
    set(state =>
      state.editedPatient
        ? {
            editedPatient: {
              ...state.editedPatient,
              [key]: value,
            },
          }
        : {},
    ),
}));

export default usePatientStore;
