'use client';

import type { Document } from '@/types';
import type { DocumentCitation } from '@/types/discharge';
import { ExternalLink, FileText } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';

type DocumentListPanelProps = {
  documents: Document[];
  highlightedCitation: DocumentCitation | null;
};

export function DocumentListPanel({ documents, highlightedCitation }: DocumentListPanelProps) {
  const fullTextRef = useRef<HTMLDivElement>(null);

  console.warn('📄 DocumentListPanel documents:', documents);

  const isDocumentCitation = highlightedCitation?.sourceType === 'selected-document'
    || highlightedCitation?.sourceType === 'retrieved-document';

  console.warn('📄 DocumentListPanel render:', {
    highlightedCitation,
    isDocumentCitation,
    documentsCount: documents.length,
    documentIds: documents.map(d => d.id),
  });

  const relevantDocument = isDocumentCitation && highlightedCitation.documentId
    ? documents.find(doc => doc.id === highlightedCitation.documentId)
    : null;

  console.warn('🎯 Relevant document found:', {
    documentId: highlightedCitation?.documentId,
    relevantDocument: relevantDocument ? { id: relevantDocument.id, filename: relevantDocument.filename, hasFullText: !!relevantDocument.full_text } : null,
  });

  // Highlighted full text with citation context highlighted
  const highlightedFullText = useMemo(() => {
    if (!relevantDocument?.full_text || !isDocumentCitation || !highlightedCitation?.context) {
      return relevantDocument?.full_text || '';
    }

    const { context } = highlightedCitation;
    const fullText = relevantDocument.full_text;

    // Try exact match first
    if (fullText.includes(context)) {
      return fullText.replace(
        context,
        `<span class="citation-highlighted-green">${context}</span>`,
      );
    }

    // If exact match fails, try fuzzy matching similar to UserContextPanel
    const contextWords = context.toLowerCase().split(/\s+/);
    const fullTextWords = fullText.toLowerCase().split(/\s+/);

    let bestMatch = { start: -1, end: -1, length: 0 };

    // Find the longest sequence of matching words
    for (let i = 0; i < fullTextWords.length; i++) {
      for (let j = 0; j < contextWords.length; j++) {
        let matchLength = 0;
        let textIndex = i;
        let contextIndex = j;

        // Count consecutive matching words
        while (
          textIndex < fullTextWords.length
          && contextIndex < contextWords.length
          && fullTextWords[textIndex] === contextWords[contextIndex]
        ) {
          matchLength++;
          textIndex++;
          contextIndex++;
        }

        // Update best match if this sequence is longer
        if (matchLength > bestMatch.length && matchLength >= 3) { // Minimum 3 words for fuzzy match
          bestMatch = { start: i, end: i + matchLength, length: matchLength };
        }
      }
    }

    // If we found a good fuzzy match, highlight it
    if (bestMatch.length > 0) {
      const originalWords = fullText.split(/(\s+)/); // Keep whitespace
      const wordIndices: number[] = [];
      let wordCount = 0;

      // Map word positions to character positions
      for (let i = 0; i < originalWords.length; i++) {
        if (originalWords[i]?.trim()) {
          if (wordCount >= bestMatch.start && wordCount < bestMatch.end) {
            wordIndices.push(i);
          }
          wordCount++;
        }
      }

      // Highlight the matched words
      for (let i = wordIndices.length - 1; i >= 0; i--) {
        const idx = wordIndices[i];
        if (idx !== undefined && originalWords[idx] !== undefined) {
          originalWords[idx] = `<span class="citation-highlighted-green">${originalWords[idx]}</span>`;
        }
      }

      return originalWords.join('');
    }

    // Fallback: no highlighting if no good match found
    return fullText;
  }, [relevantDocument?.full_text, isDocumentCitation, highlightedCitation]);

  // Auto-scroll to highlighted text when citation changes
  useEffect(() => {
    if (fullTextRef.current && isDocumentCitation && highlightedCitation?.context) {
      const timeoutId = setTimeout(() => {
        // Find the highlighted element within the full text container
        const highlightedElement = fullTextRef.current?.querySelector('.citation-highlighted-green');
        if (highlightedElement) {
          console.warn('Found highlighted element, scrolling to it:', highlightedElement);
          highlightedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        } else {
          console.warn('Could not find highlighted element to scroll to. Context:', highlightedCitation?.context);
          console.warn('Full text ref:', fullTextRef.current);
          console.warn('Available elements with citation-highlighted-green class:', fullTextRef.current?.querySelectorAll('.citation-highlighted-green'));
        }
      }, 100); // Small delay to ensure DOM is updated

      return () => clearTimeout(timeoutId);
    }

    // Return empty cleanup function when condition not met
    return () => {};
  }, [highlightedCitation?.id, isDocumentCitation, highlightedCitation?.context]);

  return (
    <div className="flex flex-col h-full">
      {/* Title Section */}
      <div className="p-4 border-b bg-muted/30">
        <h3 className="text-sm font-medium text-muted-foreground">
          Document Context
        </h3>
      </div>

      {/* Selected Document Strip */}
      {relevantDocument && (
        <div className="px-4 py-3 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-green-800 truncate">
                {relevantDocument.summary || relevantDocument.filename}
              </div>
              <div className="text-xs text-green-600">
                {relevantDocument.filename}
                {highlightedCitation?.sourceType === 'retrieved-document' && ' (RAG Retrieved)'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Scrollable Document Text */}
      {relevantDocument?.full_text
        ? (
            <div
              ref={fullTextRef}
              className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: highlightedFullText,
              }}
            />
          )
        : (
            <div className="flex-1 p-4">
              {documents.length === 0
                ? (
                    <div className="text-sm text-muted-foreground italic">
                      No documents selected
                    </div>
                  )
                : (
                    <>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Selected Documents (
                        {documents.length}
                        )
                      </h4>
                      <div className="space-y-3">
                        {documents.map(document => (
                          <div
                            key={document.id}
                            className="border rounded-lg p-3 transition-colors hover:bg-muted/50"
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
                        ))}
                      </div>
                    </>
                  )}
            </div>
          )}
    </div>
  );
}
