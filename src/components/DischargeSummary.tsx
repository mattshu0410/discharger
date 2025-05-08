'use client';
import ReactMarkdown from 'react-markdown';

type DischargeSummaryProps = {
  dischargeText: string;
};

export function DischargeSummary({ dischargeText }: DischargeSummaryProps) {
  return (
    <div className="p-6 h-full flex flex-col bg-card">
      <div className="text-xl font-semibold mb-4">Discharge Summary</div>
      <div className="text-sm leading-relaxed space-y-2 overflow-y-auto">
        <ReactMarkdown>{dischargeText}</ReactMarkdown>
      </div>
    </div>
  );
}
