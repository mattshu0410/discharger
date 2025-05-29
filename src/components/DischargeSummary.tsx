
import ReactMarkdown from 'react-markdown';

export function DischargeSummary() {
  return (
    <div className="p-6 h-full flex flex-col bg-card">
      <div className="text-xl font-semibold mb-4">Discharge Summary</div>
      <div className="text-sm leading-relaxed space-y-2 overflow-y-auto">
        <ReactMarkdown>{"To be added"}</ReactMarkdown>
      </div>
    </div>
  );
}
