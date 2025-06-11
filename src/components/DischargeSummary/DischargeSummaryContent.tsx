'use client';

import type { DischargeSummary } from '@/types/discharge';
import { DischargeSummarySection } from './DischargeSummarySection';

type DischargeSummaryContentProps = {
  summary: DischargeSummary;
};

export function DischargeSummaryContent({ summary }: DischargeSummaryContentProps) {
  // Sort sections by order
  const sortedSections = [...summary.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="p-4 space-y-4">
      {sortedSections.map(section => (
        <DischargeSummarySection key={section.id} section={section} />
      ))}
    </div>
  );
}
