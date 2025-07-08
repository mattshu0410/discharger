import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useCreatePatient } from '@/api/patients/queries';
import { usePatientStore } from '@/stores/patientStore';

export function useCreatePatientFlow() {
  const router = useRouter();
  const createPatientMutation = useCreatePatient();
  const setCurrentPatientId = usePatientStore(state => state.setCurrentPatientId);
  const setPendingPatientCreation = usePatientStore(state => state.setPendingPatientCreation);

  const createNewPatient = useCallback(async () => {
    try {
      // Generate a temporary ID to track the creation
      const tempId = `pending-${Date.now()}`;

      // Create the promise for patient creation
      const creationPromise = createPatientMutation.mutateAsync({
        name: 'New Patient',
        age: 0,
        sex: 'other' as const,
        context: '',
        document_ids: [],
      });

      // Track the pending creation
      setPendingPatientCreation(tempId, creationPromise);

      // Wait for the patient to be created
      const newPatient = await creationPromise;

      // Clear the pending creation
      setPendingPatientCreation(null, null);

      // Set the new patient as current
      setCurrentPatientId(newPatient.id);

      toast.success('New patient created', {
        description: 'You can now enter patient details.',
      });

      return newPatient;
    } catch (error) {
      console.error('Failed to create new patient:', error);
      setPendingPatientCreation(null, null);

      toast.error('Failed to create patient', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });

      throw error;
    }
  }, [createPatientMutation, setCurrentPatientId, setPendingPatientCreation, router]);

  return {
    createNewPatient,
    isCreating: createPatientMutation.isPending,
  };
}
