import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createAccessKey,
  deactivateAccessKey,
  getPatientAccessKeys,
  sendPatientAccessSMS,
} from './queries';

// Query keys
export const patientAccessKeysKeys = {
  all: ['patient-access-keys'] as const,
  byPatient: (summaryId: string) => ['patient-access-keys', summaryId] as const,
  publicSummary: (accessKey: string) => ['patient-summary-public', accessKey] as const,
};

/**
 * Hook to fetch access keys for a patient summary
 */
export function usePatientAccessKeys(summaryId: string | undefined) {
  return useQuery({
    queryKey: patientAccessKeysKeys.byPatient(summaryId!),
    queryFn: () => getPatientAccessKeys(summaryId!),
    enabled: !!summaryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create an access key
 */
export function useCreateAccessKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccessKey,
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate access keys for this summary
        queryClient.invalidateQueries({
          queryKey: patientAccessKeysKeys.byPatient(variables.summary_id),
        });

        const action = data.was_existing ? 'retrieved' : 'created';
        toast.success(`Access key ${action} successfully`);
      } else {
        toast.error(data.error || 'Failed to create access key');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create access key');
    },
  });
}

/**
 * Hook to send SMS with access link
 */
export function useSendPatientAccessSMS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendPatientAccessSMS,
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate access keys for this summary
        queryClient.invalidateQueries({
          queryKey: patientAccessKeysKeys.byPatient(variables.summary_id),
        });

        toast.success('SMS sent successfully!');
      } else {
        toast.error(data.error || 'Failed to send SMS');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send SMS');
    },
  });
}

/**
 * Hook to deactivate an access key
 */
export function useDeactivateAccessKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateAccessKey,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate all access keys queries
        queryClient.invalidateQueries({
          queryKey: patientAccessKeysKeys.all,
        });

        toast.success('Access removed successfully');
      } else {
        toast.error(data.error || 'Failed to remove access');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove access');
    },
  });
}
