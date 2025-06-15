'use client';

import type { Citation } from '@/types/discharge';
import { useEffect, useMemo, useRef } from 'react';

type UserContextPanelProps = {
  context: string;
  highlightedCitation: Citation | null;
};

export function UserContextPanel({ context, highlightedCitation }: UserContextPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const highlightedContent = useMemo(() => {
    if (!highlightedCitation || highlightedCitation.sourceType !== 'user-context') {
      return context;
    }

    const { context: citationContext } = highlightedCitation;
    if (!citationContext) {
      return context;
    }

    // Try exact match first
    if (context.includes(citationContext)) {
      return context.replace(
        citationContext,
        `<span class="citation-highlighted-blue">${citationContext}</span>`,
      );
    }

    // If exact match fails, try fuzzy matching by finding the best substring match
    // Split citation context into words and try to find the longest matching sequence
    const citationWords = citationContext.toLowerCase().split(/\s+/);
    const contextWords = context.toLowerCase().split(/\s+/);

    let bestMatch = { start: -1, end: -1, length: 0 };

    // Find the longest sequence of matching words
    for (let i = 0; i < contextWords.length; i++) {
      for (let j = 0; j < citationWords.length; j++) {
        let matchLength = 0;
        let contextIndex = i;
        let citationIndex = j;

        // Count consecutive matching words
        while (
          contextIndex < contextWords.length
          && citationIndex < citationWords.length
          && contextWords[contextIndex] === citationWords[citationIndex]
        ) {
          matchLength++;
          contextIndex++;
          citationIndex++;
        }

        // Update best match if this sequence is longer
        if (matchLength > bestMatch.length && matchLength >= 3) { // Minimum 3 words for fuzzy match
          bestMatch = { start: i, end: i + matchLength, length: matchLength };
        }
      }
    }

    // If we found a good fuzzy match, highlight it
    if (bestMatch.length > 0) {
      const originalWords = context.split(/(\s+)/); // Keep whitespace
      const wordIndices = [];
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
          originalWords[idx] = `<span class="citation-highlighted-blue">${originalWords[idx]}</span>`;
        }
      }

      return originalWords.join('');
    }

    // Fallback: no highlighting if no good match found
    return context;
  }, [context, highlightedCitation]);

  // Auto-scroll to highlighted text when citation changes
  useEffect(() => {
    const isContextCitation = highlightedCitation?.sourceType === 'user-context';
    if (contentRef.current && isContextCitation && highlightedCitation?.context) {
      const timeoutId = setTimeout(() => {
        // Find the highlighted element within the content container
        const highlightedElement = contentRef.current?.querySelector('.citation-highlighted-blue');
        if (highlightedElement) {
          console.warn('Found highlighted element in context, scrolling to it:', highlightedElement);
          highlightedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        } else {
          console.warn('Could not find highlighted element in context. Context:', highlightedCitation?.context);
          console.warn('Content ref:', contentRef.current);
          console.warn('Available blue highlight elements:', contentRef.current?.querySelectorAll('.citation-highlighted-blue'));
        }
      }, 100); // Small delay to ensure DOM is updated

      return () => clearTimeout(timeoutId);
    }

    // Return empty cleanup function when condition not met
    return () => {};
  }, [highlightedCitation?.id, highlightedCitation?.sourceType, highlightedCitation?.context]);

  return (
    <div className="p-4">
      <div className="prose prose-sm max-w-none">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Patient Clinical Context
        </h4>
        <div
          ref={contentRef}
          className="whitespace-pre-wrap text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
        />
      </div>
    </div>
  );
}
