'use client';

import { createContext, use, useMemo, useState } from 'react';

const PatientContext = createContext<{
  selectedPatient: number | null;
  setSelectedPatient: (id: number) => void;
} | null>(null);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  // https://www.reddit.com/r/reactjs/comments/zzcgr2/why_is_usememo_commonlyused_in_reacts_context/
  const value = useMemo(() => {
    return { selectedPatient, setSelectedPatient };
  }, [selectedPatient]);

  return (
    <PatientContext value={value}>
      {children}
    </PatientContext>
  );
}

export function usePatientContext() {
  const context = use(PatientContext);
  if (!context) {
    throw new Error('usePatientContext must be used within a PatientProvider');
  }
  return context;
}
