'use client';

import { format } from 'date-fns';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDischargeSummaryStore } from '@/stores';

export function DischargeSummaryHeader() {
  const { lastGeneratedAt, isRegenerating } = useDischargeSummaryStore();

  const handleRegenerate = () => {
    // TODO: Implement regeneration logic
    console.warn('Regenerate discharge summary');
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
