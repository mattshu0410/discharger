import { useCallback } from 'react';
import { toast } from 'sonner';
import { useCreatePatient } from '@/api/patients/queries';
import { usePatientStore } from '@/stores/patientStore';

export function useNewPatient() {
  const createPatient = useCreatePatient();
  const setCurrentPatientId = usePatientStore(state => state.setCurrentPatientId);
  const setSaveStatus = usePatientStore(state => state.setSaveStatus);
  const setSaveError = usePatientStore(state => state.setSaveError);

  const createNewPatient = useCallback(async (name: string, context: string) => {
    try {
      setSaveStatus('saving');
      setSaveError(null);

      // Validate inputs
      if (!name.trim()) {
        throw new Error('Patient name is required');
      }

      const newPatient = await createPatient.mutateAsync({
        name: name.trim(),
        age: 0, // Default value - user can update later
        sex: 'other' as const, // Default value - user can update later
        context: context.trim(),
        document_ids: [],
      });

      // Update the store with the real patient ID
      setCurrentPatientId(newPatient.id);
      setSaveStatus('saved');

      toast.success('New patient created successfully', {
        description: `Patient "${name}" has been created and is ready for clinical notes.`,
      });

      return newPatient;
    } catch (error) {
      console.error('Failed to create new patient:', error);
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Failed to create patient');

      toast.error('Failed to create patient', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });

      throw error;
    }
  }, [createPatient, setCurrentPatientId, setSaveStatus, setSaveError]);

  return {
    createNewPatient,
    isCreating: createPatient.isPending,
  };
}
