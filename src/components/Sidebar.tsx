'use client';
import type { Patient } from '@/types/patient';
import { usePatientContext } from '@/context/PatientContext';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Cog,
  Database,
  FileText,
  Menu,
  User,
  UserCircle,
} from '@mynaui/icons-react';
import { useState } from 'react';

export function Sidebar() {
  const { selectedPatient, setSelectedPatient } = usePatientContext();
  // Dummy patient data for sidebar
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
  console.warn(selectedPatient);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div
      className={`h-full transition-all duration-300 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] flex flex-col ${
        sidebarOpen ? 'w-64 min-w-[16rem]' : 'w-12 min-w-[3rem]'
      }`}
    >
      <button
        className="m-2 p-1 rounded hover:bg-[var(--sidebar-accent)] transition-colors flex items-center justify-center"
        onClick={() => setSidebarOpen(v => !v)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
      <div className="flex-1 overflow-y-auto">
        {sidebarOpen && (
          <>
            <div className="px-4 py-2 text-xs font-semibold text-[var(--sidebar-accent-foreground)] uppercase tracking-wider flex items-center gap-2">
              <Menu size={16} />
              {' '}
              Today
            </div>
            <ul className="space-y-1">
              {patients.map((p, i) => (
                <li key={p.id} className="list-none">
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2 cursor-pointer rounded transition-colors outline-none flex items-center gap-2 ${
                      selectedPatient === i
                        ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]'
                        : 'hover:bg-[var(--sidebar-accent)]'
                    }`}
                    onClick={() => {
                      setSelectedPatient(i);
                    }}
                  >
                    <User size={18} />
                    <div>
                      <div className="font-medium text-base leading-tight">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.summary}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-8 px-4 text-xs text-muted-foreground space-y-2">
              <div className="font-semibold flex items-center gap-2">
                <Cog size={16} />
                {' '}
                Settings
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} />
                {' '}
                My Snippets
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                {' '}
                Preferences
              </div>
              <div className="flex items-center gap-2">
                <Database size={16} />
                {' '}
                Memory
              </div>
              <div className="flex items-center gap-2">
                <UserCircle size={16} />
                {' '}
                Account
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
