import type { BlockType } from '@/types/blocks';

export type GenerateBlocksRequest = {
  dischargeSummary: string;
  blockTypes?: BlockType[];
};

export type GenerateBlocksResponse = {
  blocks: any[]; // Will be validated to Block[] type
  metadata: {
    patientName?: string;
    dischargeDate?: string;
    primaryDiagnosis?: string;
  };
};

// Generate blocks from discharge summary
export const generateBlocks = async (data: GenerateBlocksRequest): Promise<GenerateBlocksResponse> => {
  const response = await fetch('/api/blocks/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate blocks');
  }

  return response.json();
};
