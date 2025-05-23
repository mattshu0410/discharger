'use client';
import type { Patient } from '@/types/patient';
import { getAllPatients, getPatientById } from '@/hooks/patients';
import usePatientStore from '@/stores/patientStore';
import {
  BookOpen,
  Cog,
  Database,
  FileText,
  Menu,
  PanelLeft,
  SidebarAlt,
  User,
  UserCircle,
} from '@mynaui/icons-react';
import { useQuery } from '@tanstack/react-query';

import { useEffect, useState } from 'react';

export function Sidebar() {
  const currentPatientId = usePatientStore(state => state.currentPatientId);
  const setCurrentPatientId = usePatientStore(state => state.setCurrentPatientId);
  const setEditedPatient = usePatientStore(state => state.setEditedPatient);

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ['getPatients', { limit: 10 }],
    queryFn: () => getAllPatients(10),
  });

  const { data: fetchedPatient } = useQuery<Patient | null>({
    queryKey: ['getPatientbyId', currentPatientId],
    queryFn: () => getPatientById(currentPatientId!),
    enabled: !!currentPatientId,
  });

  useEffect(() => {
    if (fetchedPatient) {
      setEditedPatient(fetchedPatient);
    }
  }, [fetchedPatient]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div
      className={`h-full transition-all duration-300 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] flex flex-col ${
        sidebarOpen ? 'w-64 min-w-[16rem]' : 'w-12 min-w-[3rem]'
      }`}
    >
      <button
        className="m-2 p-1 rounded hover:bg-[var(--sidebar-accent)] transition-colors"
        onClick={() => setSidebarOpen(v => !v)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <SidebarAlt size={20} /> : <PanelLeft size={20} />}
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
              {patients?.map(p => (
                <li key={p.id} className="list-none">
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2 cursor-pointer rounded transition-colors outline-none flex items-center gap-2 ${
                      currentPatientId === p.id
                        ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]'
                        : 'hover:bg-[var(--sidebar-accent)]'
                    }`}
                    onClick={() => {
                      setCurrentPatientId(p.id);
                    }}
                  >
                    <User size={18} />
                    <div className="flex flex-col overflow-hidden flex-1">
                      <div className="font-medium text-base leading-tight">
                        {p.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{p.context}</div>
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
