'use client';

import { useDischargeSummaryStore } from '@/stores';
import { Loader2 } from 'lucide-react';
import { DischargeSummaryContent } from './DischargeSummaryContent';
import { DischargeSummaryHeader } from './DischargeSummaryHeader';
import { FeedbackInput } from './FeedbackInput';

export function DischargeSummaryPanel() {
  const { currentSummary, isGenerating, error } = useDischargeSummaryStore();

  // Loading state
  if (isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Generating discharge summary...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-destructive text-center max-w-md">
          <p className="font-semibold mb-2">Error generating summary</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!currentSummary) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <p>No discharge summary generated yet.</p>
        <p className="text-sm mt-2">Enter patient context and click "Generate Discharge Summary"</p>
      </div>
    );
  }

  // Content state
  return (
    <div className="flex-1 flex flex-col h-full">
      <DischargeSummaryHeader />

      <div className="flex-1 overflow-y-auto">
        <DischargeSummaryContent summary={currentSummary} />
      </div>

      <div className="border-t">
        <FeedbackInput />
      </div>
    </div>
  );
}
