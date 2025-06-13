'use client';

import { useDischargeSummaryStore, usePatientStore } from '@/stores';
import { ContextViewerHeader } from './ContextViewerHeader';
import { DocumentListPanel } from './DocumentListPanel';
import { UserContextPanel } from './UserContextPanel';

export function ContextViewer() {
  const { highlightedCitation } = useDischargeSummaryStore();
  const { currentPatientContext, selectedDocuments } = usePatientStore();

  return (
    <div className="flex flex-col h-full">
      <ContextViewerHeader />

      <div className="flex-1 overflow-y-auto">
        {highlightedCitation?.sourceType === 'user-context'
          ? (
              <UserContextPanel
                context={currentPatientContext}
                highlightedCitation={highlightedCitation}
              />
            )
          : (
              <DocumentListPanel
                documents={selectedDocuments}
                highlightedCitation={highlightedCitation}
              />
            )}
      </div>
    </div>
  );
}
