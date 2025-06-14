import { useCallback } from 'react';
import { useUpdatePatient } from '@/api/patients/queries';
import { usePatientStore } from '@/stores/patientStore';

export function useAutoSave() {
  const updatePatient = useUpdatePatient();
  const setSaveStatus = usePatientStore(state => state.setSaveStatus);
  const setSaveError = usePatientStore(state => state.setSaveError);
  const setLastSaved = usePatientStore(state => state.setLastSaved);

  const savePatientContext = useCallback(async (patientId: string, context: string, _patientName?: string) => {
    try {
      setSaveStatus('saving');
      setSaveError(null);

      const isNewPatient = patientId.startsWith('new-');

      if (isNewPatient) {
        // Don't auto-save new patients - they should only be created via explicit form submission
        setSaveStatus('idle');
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
  }, [updatePatient, setSaveStatus, setSaveError, setLastSaved]);

  return { savePatientContext };
}
