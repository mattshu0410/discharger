'use client';

import type { Document } from '@/types';
import type { Citation } from '@/types/discharge';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText } from 'lucide-react';

type DocumentListPanelProps = {
  documents: Document[];
  highlightedCitation: Citation | null;
};

export function DocumentListPanel({ documents, highlightedCitation }: DocumentListPanelProps) {
  const isDocumentCitation = highlightedCitation?.sourceType === 'selected-document'
    || highlightedCitation?.sourceType === 'retrieved-document';

  const relevantDocument = isDocumentCitation && highlightedCitation.documentId
    ? documents.find(doc => doc.id === highlightedCitation.documentId)
    : null;

  return (
    <div className="p-4">
      {isDocumentCitation && highlightedCitation && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-800 mb-1">
            Highlighted Citation
          </div>
          <div className="text-sm text-green-700 mb-2">
            "
            {highlightedCitation.text}
            "
          </div>
          <div className="text-xs text-green-600 space-y-1">
            {highlightedCitation.pageNumber && (
              <div>
                Page:
                {highlightedCitation.pageNumber}
              </div>
            )}
            {highlightedCitation.chunkId && (
              <div>
                Chunk:
                {highlightedCitation.chunkId}
              </div>
            )}
            <div>
              Relevance:
              {(highlightedCitation.relevanceScore * 100).toFixed(1)}
              %
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          Selected Documents (
          {documents.length}
          )
        </h4>

        {documents.length === 0
          ? (
              <div className="text-sm text-muted-foreground italic">
                No documents selected
              </div>
            )
          : (
              documents.map(document => (
                <div
                  key={document.id}
                  className={`border rounded-lg p-3 transition-colors ${
                    relevantDocument?.id === document.id
                      ? 'border-green-300 bg-green-50'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">
                          {document.summary || document.filename}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {document.filename}
                        </div>
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {document.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-block px-1.5 py-0.5 bg-muted text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 flex-shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
      </div>
    </div>
  );
}
