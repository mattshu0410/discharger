'use client';
import { DischargeSummary } from '@/components/DischargeSummary';
import { PatientForm } from '@/components/PatientForm';
import { useState } from 'react';

export default function Index() {
  const [dischargeText, setDischargeText] = useState('');

  const handleGenerate = async (context: string) => {
    try {
      const res = await fetch('./api/discharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });
      const text = await res.text();
      setDischargeText(text);
    } catch (err) {
      console.warn('Error:', err);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex flex-row bg-background">
        {/* Left: Form */}
        <div className="w-1/2 p-8 flex flex-col gap-6 border-r border-border">
          <PatientForm
            onGenerateAction={handleGenerate}
          />
        </div>
        {/* Right: Discharge Summary */}
        <div className="w-1/2 p-8 overflow-y-auto">
          <DischargeSummary dischargeText={dischargeText} />
        </div>
      </div>
    </div>
  );
}
