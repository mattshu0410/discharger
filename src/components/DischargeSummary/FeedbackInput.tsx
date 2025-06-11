'use client';

import { useRegenerateDischargeSummary } from '@/api/discharge/queries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDischargeSummaryStore, usePatientStore } from '@/stores';
import { Loader2, Send } from 'lucide-react';

export function FeedbackInput() {
  const {
    pendingFeedback,
    updatePendingFeedback,
    isRegenerating,
    currentSummary,
    setDischargeSummary,
    addFeedbackToHistory,
    setError,
    setIsRegenerating,
  } = useDischargeSummaryStore();

  const { currentPatientId, currentPatientContext, selectedDocuments } = usePatientStore();

  const regenerateMutation = useRegenerateDischargeSummary();

  const handleSubmit = async () => {
    if (!pendingFeedback.trim() || !currentSummary) {
      return;
    }

    try {
      setIsRegenerating(true);
      setError(null);

      // Prepare regeneration request with current summary
      const request = {
        patientId: currentPatientId,
        context: currentPatientContext,
        documentIds: selectedDocuments.map(doc => doc.id),
        feedback: pendingFeedback,
        currentSummary, // Send current summary for modification
      };

      // Call regeneration API
      const result = await regenerateMutation.mutateAsync(request);

      // Update store with new summary
      setDischargeSummary(result.summary);

      // Add feedback to history
      addFeedbackToHistory(pendingFeedback);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to regenerate summary');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="feedback-input" className="text-sm font-medium">
          Provide feedback to regenerate summary
        </label>
        <div className="flex gap-2">
          <Textarea
            id="feedback-input"
            placeholder="e.g., 'All medications should be formatted as medication | dosage | frequency'"
            value={pendingFeedback}
            onChange={e => updatePendingFeedback(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none"
            disabled={isRegenerating}
          />
          <Button
            onClick={handleSubmit}
            disabled={!pendingFeedback.trim() || isRegenerating || !currentSummary}
            size="sm"
            className="self-end"
          >
            {isRegenerating
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Cmd/Ctrl + Enter to submit
        </p>
      </div>
    </div>
  );
}
