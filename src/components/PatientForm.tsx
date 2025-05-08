'use client';
import type { Patient } from '@/types/patient';
import { Input } from '@/components/ui/input';
import { usePatientContext } from '@/context/PatientContext';
import { useRef, useState } from 'react';

export function PatientForm({ onGenerateAction }: { onGenerateAction: (context: string) => void }) {
  const patients: Patient[] = [
    {
      id: 0,
      name: 'Patient 1',
      summary: '6yo M with FOOSH, supracondylar fracture, neurovascularly intact.',
    },
    {
      id: 1,
      name: 'Patient 2',
      summary: '12yo F with increased work of breathing, history of asthma.',
    },
  ];
  const { selectedPatient } = usePatientContext();
  const patient = patients.find(p => p.id === selectedPatient);
  const [clinicalContext, setClinicalContext] = useState('');
  const clinicalContextRef = useRef<HTMLTextAreaElement>(null);
  const patientName = patient?.name || '';
  const onContextChange = (context: string) => {
    setClinicalContext(context);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-base font-semibold mb-1" htmlFor="patientName">
          Patient Name
        </label>
        <Input id="patientName" placeholder="Enter patient name" className="mb-2" value={patientName} readOnly />
      </div>
      <div>
        <label className="block text-base font-semibold mb-1" htmlFor="clinicalContext">
          Clinical Context
        </label>
        <textarea
          id="clinicalContext"
          ref={clinicalContextRef}
          className="w-full min-h-[120px] rounded-md border border-input bg-card px-3 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-colors outline-none"
          placeholder="Paste any relevant contextual information e.g. progress notes"
          value={clinicalContext}
          onChange={e => onContextChange(e.target.value)}
        />
      </div>
      <div>
        <div className="font-semibold mb-2">Resources</div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">RCH Clinical Practice Guidelines</span>
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">RNSH Guidelines</span>
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">NSWHealth Guidelines</span>
          <button className="px-3 py-1 rounded-full border border-muted-foreground text-xs font-medium hover:bg-muted transition-colors">Add Extra +</button>
        </div>
        <button
          className="mt-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-colors"
          onClick={() => onGenerateAction(clinicalContext)}
        >
          Generate Discharge
        </button>
      </div>
    </div>
  );
}
