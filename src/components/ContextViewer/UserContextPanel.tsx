'use client';

import type { Citation } from '@/types/discharge';
import { useMemo } from 'react';

type UserContextPanelProps = {
  context: string;
  highlightedCitation: Citation | null;
};

export function UserContextPanel({ context, highlightedCitation }: UserContextPanelProps) {
  const highlightedContent = useMemo(() => {
    if (!highlightedCitation || highlightedCitation.sourceType !== 'user-context') {
      return context;
    }

    const { text } = highlightedCitation;
    if (!text || !context.includes(text)) {
      return context;
    }

    // Simple highlighting - replace with more sophisticated matching later
    return context.replace(
      text,
      `<mark class="bg-blue-200 text-blue-900 px-1 rounded">${text}</mark>`,
    );
  }, [context, highlightedCitation]);

  return (
    <div className="p-4">
      <div className="prose prose-sm max-w-none">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Patient Clinical Context
        </h4>
        <div
          className="whitespace-pre-wrap text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
        />
      </div>
    </div>
  );
}
