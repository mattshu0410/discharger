import { useCreatePatient, useUpdatePatient } from '@/api/patients/queries';
import { usePatientStore } from '@/stores/patientStore';
import { useCallback } from 'react';

export function useAutoSave() {
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const setSaveStatus = usePatientStore(state => state.setSaveStatus);
  const setSaveError = usePatientStore(state => state.setSaveError);
  const setLastSaved = usePatientStore(state => state.setLastSaved);
  const setCurrentPatientId = usePatientStore(state => state.setCurrentPatientId);

  const savePatientContext = useCallback(async (patientId: string, context: string, patientName?: string) => {
    try {
      setSaveStatus('saving');
      setSaveError(null);

      const isNewPatient = patientId.startsWith('new-');

      if (isNewPatient) {
        // Create new patient first
        if (!patientName || !patientName.trim()) {
          // Use a default name if none provided
          patientName = `Patient ${new Date().toLocaleDateString()}`;
        }

        const newPatient = await createPatient.mutateAsync({
          name: patientName,
          age: 0, // Default values - these should be updated later
          sex: 'other' as const,
          context,
          document_ids: [],
        });

        // Update the store with the real patient ID
        setCurrentPatientId(newPatient.id);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } else {
        // Update existing patient
        await updatePatient.mutateAsync({
          id: patientId,
          data: { context },
        });

        setSaveStatus('saved');
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to save patient context:', error);
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    }
  }, [createPatient, updatePatient, setSaveStatus, setSaveError, setLastSaved, setCurrentPatientId]);

  return { savePatientContext };
}
