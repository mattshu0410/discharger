'use client';

import { format } from 'date-fns';
import { Clock, RefreshCw } from 'lucide-react';
import { useGenerateDischargeSummary } from '@/api/discharge/queries';
import { Button } from '@/components/ui/button';
import { useDischargeSummaryStore, usePatientStore } from '@/stores';

export function DischargeSummaryHeader() {
  const { lastGeneratedAt, isRegenerating, setDischargeSummary, setError, setIsRegenerating } = useDischargeSummaryStore();
  const { currentPatientId, currentPatientContext, selectedDocuments } = usePatientStore();

  const generateMutation = useGenerateDischargeSummary();

  const handleRegenerate = async () => {
    if (!currentPatientId || !currentPatientContext) {
      setError('No patient data available for regeneration');
      return;
    }

    try {
      setIsRegenerating(true);
      setError(null);

      // Prepare regeneration request (fresh generation)
      const request = {
        patientId: currentPatientId,
        context: currentPatientContext,
        documentIds: selectedDocuments.map(doc => doc.id),
      };

      // Call generation API for fresh regeneration
      const result = await generateMutation.mutateAsync(request);

      // Update store with new summary
      setDischargeSummary(result.summary);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to regenerate summary');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Discharge Summary</h2>
        {lastGeneratedAt && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{format(lastGeneratedAt, 'HH:mm')}</span>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRegenerate}
        disabled={isRegenerating}
      >
        {isRegenerating
          ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            )
          : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </>
            )}
      </Button>
    </div>
  );
}
