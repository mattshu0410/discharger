'use client';

import { Button } from '@/components/ui/button';
import { useDischargeSummaryStore } from '@/stores';
import { FileText, MessageSquare, X } from 'lucide-react';

export function ContextViewerHeader() {
  const { highlightedCitation, highlightCitation } = useDischargeSummaryStore();

  const handleClear = () => {
    highlightCitation(null);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-muted/50">
      <div className="flex items-center gap-2">
        {highlightedCitation?.sourceType === 'user-context'
          ? (
              <>
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-blue-600">Patient Context</h3>
              </>
            )
          : (
              <>
                <FileText className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold text-green-600">Documents</h3>
              </>
            )}

        {highlightedCitation && (
          <span className="text-sm text-muted-foreground">
            Citation: "
            {highlightedCitation.text.substring(0, 30)}
            ..."
          </span>
        )}
      </div>

      {highlightedCitation && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
