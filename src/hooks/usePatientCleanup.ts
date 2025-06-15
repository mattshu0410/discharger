import { useCallback, useEffect } from 'react';
import { useDeletePatient } from '@/api/patients/queries';
import { usePatientStore } from '@/stores/patientStore';

export function usePatientCleanup() {
  const deletePatient = useDeletePatient();
  const currentPatientId = usePatientStore(state => state.currentPatientId);
  const currentPatientContext = usePatientStore(state => state.currentPatientContext);

  // Helper function to determine if patient should be deleted (empty patient)
  const shouldDeleteEmptyPatient = useCallback((patientId: string, context: string, name?: string) => {
    return patientId
      && !name?.trim()
      && !context?.trim();
  }, []);

  // Cleanup empty patient
  const cleanupEmptyPatient = useCallback(async (patientId: string, context: string, name?: string) => {
    if (shouldDeleteEmptyPatient(patientId, context, name)) {
      try {
        await deletePatient.mutateAsync(patientId);
        // console.warn('Cleaned up empty patient:', patientId);
      } catch (error) {
        console.error('Failed to cleanup empty patient:', error);
        // Don't show error to user - this is background cleanup
      }
    }
  }, [deletePatient, shouldDeleteEmptyPatient]);

  // Cleanup current patient if empty when navigating away
  const cleanupCurrentPatient = useCallback(async () => {
    if (currentPatientId && currentPatientContext !== undefined) {
      await cleanupEmptyPatient(currentPatientId, currentPatientContext);
    }
  }, [currentPatientId, currentPatientContext, cleanupEmptyPatient]);

  // Add beforeunload listener for page navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Note: This is fire-and-forget due to browser limitations
      // Most browsers don't wait for async operations in beforeunload
      if (currentPatientId && shouldDeleteEmptyPatient(currentPatientId, currentPatientContext || '')) {
        // Use navigator.sendBeacon for better reliability during page unload
        navigator.sendBeacon('/api/patients/cleanup', JSON.stringify({
          patientId: currentPatientId,
          context: currentPatientContext || '',
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentPatientId, currentPatientContext, shouldDeleteEmptyPatient]);

  return {
    cleanupEmptyPatient,
    cleanupCurrentPatient,
    shouldDeleteEmptyPatient,
  };
}
