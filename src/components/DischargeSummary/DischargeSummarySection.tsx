'use client';

import type { DischargeSection } from '@/types/discharge';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDischargeSummaryStore } from '@/stores';

type DischargeSummarySectionProps = {
  section: DischargeSection;
};

export function DischargeSummarySection({ section }: DischargeSummarySectionProps) {
  const [copied, setCopied] = useState(false);
  const { highlightedSection, highlightSection } = useDischargeSummaryStore();

  const isHighlighted = highlightedSection === section.id;

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

      <div className="prose prose-sm max-w-none">
        {/* For now, render content as-is. Later we'll parse citations */}
        <p className="whitespace-pre-wrap">{section.content}</p>
      </div>

      {/* Placeholder for citations - will implement in Phase 2 */}
      {section.citations.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            {section.citations.length}
            {' '}
            citation
            {section.citations.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
