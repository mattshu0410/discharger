import type { GenerateDischargeSummaryRequest, GenerateDischargeSummaryResponse } from '@/types/discharge';
import { useMutation } from '@tanstack/react-query';
import { generateDischargeSummary, regenerateDischargeSummaryWithFeedback } from './hooks';

export function useGenerateDischargeSummary() {
  return useMutation<GenerateDischargeSummaryResponse, Error, GenerateDischargeSummaryRequest>({
    mutationKey: ['discharge', 'generate'],
    mutationFn: generateDischargeSummary,
  });
}

export function useRegenerateDischargeSummary() {
  return useMutation<GenerateDischargeSummaryResponse, Error, GenerateDischargeSummaryRequest>({
    mutationKey: ['discharge', 'regenerate'],
    mutationFn: regenerateDischargeSummaryWithFeedback,
  });
}
