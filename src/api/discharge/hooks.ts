import type { GenerateDischargeSummaryRequest, GenerateDischargeSummaryResponse } from '@/types/discharge';

export async function generateDischargeSummary(request: GenerateDischargeSummaryRequest): Promise<GenerateDischargeSummaryResponse> {
  const response = await fetch('/api/discharge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate discharge summary' }));
    throw new Error(error.error || 'Failed to generate discharge summary');
  }

  return response.json();
}

export async function regenerateDischargeSummaryWithFeedback(
  request: GenerateDischargeSummaryRequest,
): Promise<GenerateDischargeSummaryResponse> {
  // Same endpoint, just with feedback parameter included
  return generateDischargeSummary(request);
}
