'use client';

import type { DischargeSection } from '@/types/discharge';
import { Button } from '@/components/ui/button';
import { useDischargeSummaryStore, useUIStore } from '@/stores';
import { Check, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';

type DischargeSummarySectionProps = {
  section: DischargeSection;
};

export function DischargeSummarySection({ section }: DischargeSummarySectionProps) {
  const [copied, setCopied] = useState(false);
  const { highlightedSection, highlightSection, highlightCitation } = useDischargeSummaryStore();
  const { setContextViewerOpen } = useUIStore();

  const isHighlighted = highlightedSection === section.id;

  // Parse content and render <CIT> tags as clickable highlighted elements
  const renderedContent = useMemo(() => {
    if (!section.citations.length) {
      return section.content;
    }

    let content = section.content;

    // Replace <CIT id="citationId">text</CIT> with clickable highlighted spans
    const citRegex = /<CIT id="([^"]+)">([^<]+)<\/CIT>/g;

    content = content.replace(citRegex, (_match, _citationLlmId, citedText) => {
      // Find the actual citation object by matching the LLM ID to our processed citation
      const citation = section.citations.find((c) => {
        // The LLM uses simple IDs like "c1", "d1", we need to find the matching citation
        return c.text === citedText; // Match by text for now, could be improved
      });

      if (citation) {
        const citationColor = citation.sourceType === 'user-context' ? 'blue' : 'green';
        return `<span class="citation-highlight citation-highlight-${citationColor} cursor-pointer px-1 rounded-sm hover:bg-opacity-80 transition-colors" data-citation-id="${citation.id}">${citedText}</span>`;
      }

      // Fallback if citation not found
      return citedText;
    });

    return content;
  }, [section.content, section.citations]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${section.title}\n\n${section.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSectionClick = () => {
    highlightSection(isHighlighted ? null : section.id);
  };

  const handleCitationClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('citation-highlight')) {
      event.stopPropagation();
      const citationId = target.getAttribute('data-citation-id');
      const citation = section.citations.find(c => c.id === citationId);

      if (citation) {
        highlightCitation(citation);
        setContextViewerOpen(true);
      }
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-colors cursor-pointer ${
        isHighlighted ? 'bg-primary/5 border-primary/50' : 'hover:bg-muted/50'
      }`}
      onClick={handleSectionClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSectionClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{section.title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="ml-2"
        >
          {copied
            ? (
                <Check className="h-4 w-4 text-green-600" />
              )
            : (
                <Copy className="h-4 w-4" />
              )}
        </Button>
      </div>

      <div
        className="prose prose-sm max-w-none"
        onClick={handleCitationClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCitationClick(e as any);
          }
        }}
        role="presentation"
      >
        <div
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      </div>

      {/* Citations count and types */}
      {section.citations.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {section.citations.length}
              {' '}
              citation
              {section.citations.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-1">
              {section.citations.some(c => c.sourceType === 'user-context') && (
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" title="Patient Context" />
              )}
              {section.citations.some(c => c.sourceType === 'selected-document' || c.sourceType === 'retrieved-document') && (
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full" title="Documents" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
