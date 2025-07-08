'use client';
import {
  Archive,
  BookOpen,
  FileDown,
  FileText,
  HardDrive,
  PanelLeft,
  Plus,
  SidebarClose,
  User,
  UserCircle,
  X,
  Zap,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDeletePatient, usePatients } from '@/api/patients/queries';
import { Button } from '@/components/ui/button';
import { useCreatePatientFlow } from '@/hooks/useCreatePatientFlow';
import { cn } from '@/libs/utils';
import { usePatientStore } from '@/stores/patientStore';
import { useUIStore } from '@/stores/uiStore';

export function NewSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPatientId = usePatientStore(state => state.currentPatientId);
  const setCurrentPatientId = usePatientStore(state => state.setCurrentPatientId);

  // UI state from the new UI store (only non-navigation state)
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);

  const { data: patients } = usePatients();
  const deletePatientMutation = useDeletePatient();
  const { createNewPatient, isCreating } = useCreatePatientFlow();

  // Handle patient deletion
  const handleDeletePatient = async (patientId: string, patientName: string) => {
    toast(`Delete patient "${patientName}"?`, {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deletePatientMutation.mutateAsync(patientId);
            // If the deleted patient was currently selected, clear the selection
            if (currentPatientId === patientId) {
              setCurrentPatientId(null);
            }
            toast.success(`Patient "${patientName}" has been deleted successfully.`);
          } catch (error) {
            console.error('Failed to delete patient:', error);
            toast.error('Failed to delete patient. Please try again.');
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          // Do nothing, toast will close
        },
      },
    });
  };

  // Derive active settings tab from URL
  const activeSettingsTab
    = pathname === '/memory'
      ? 'memory'
      : pathname === '/snippets'
        ? 'snippets'
        : pathname === '/profile'
          ? 'profile'
          : null; // no default - only highlight when actually on a settings page

  return (
    <div
      id="sidebar"
      className={cn(
        'h-screen overflow-hidden transition-all duration-300 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] flex flex-col',
        isSidebarOpen ? 'w-64 min-w-[16rem]' : 'w-12 min-w-[3rem]',
      )}
    >
      {/* Top controls - toggle and new patient button */}
      <div className="flex items-center gap-2 p-3 border-b border-[var(--sidebar-border)]">
        {isSidebarOpen && (
          <Button
            id="new-patient-btn"
            className="flex-1 justify-start h-9"
            size="sm"
            onClick={createNewPatient}
            disabled={isCreating}
          >
            <Plus size={16} className="mr-2" />
            New Patient
          </Button>
        )}
        <button
          id="sidebar-toggle"
          type="button"
          className="h-9 w-9 flex items-center justify-center rounded hover:bg-[var(--sidebar-accent)] transition-colors flex-shrink-0"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <SidebarClose size={20} /> : <PanelLeft size={20} />}
        </button>
      </div>

      {isSidebarOpen && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Workflows section - new section at top */}
          <div className="px-4 py-4 space-y-2 border-b border-[var(--sidebar-border)]">
            <div className="text-xs font-semibold text-[var(--sidebar-accent-foreground)] uppercase tracking-wider mb-2">
              Workflows
            </div>
            <button
              type="button"
              className={cn(
                'w-full text-left px-2 py-2 rounded transition-colors flex items-center gap-2',
                pathname === '/'
                  ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                  : 'hover:bg-[var(--sidebar-accent)]',
              )}
              onClick={() => router.push('/')}
            >
              <Zap size={16} />
              Auto-Discharge
            </button>
            <button
              type="button"
              className={cn(
                'w-full text-left px-2 py-2 rounded transition-colors flex items-center gap-2',
                pathname === '/composer'
                  ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                  : 'hover:bg-[var(--sidebar-accent)]',
              )}
              onClick={() => router.push('/composer')}
            >
              <FileDown size={16} />
              Discharge Simplifier
            </button>
          </div>

          {/* Settings section - now below workflows */}
          <div className="px-4 py-4 space-y-2 border-b border-[var(--sidebar-border)]">
            <div className="text-xs font-semibold text-[var(--sidebar-accent-foreground)] uppercase tracking-wider mb-2">
              Settings
            </div>
            <button
              id="memory-nav-link"
              type="button"
              className={cn(
                'w-full text-left px-2 py-2 rounded transition-colors flex items-center gap-2',
                activeSettingsTab === 'memory'
                  ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                  : 'hover:bg-[var(--sidebar-accent)]',
              )}
              onClick={() => router.push('/memory')}
            >
              <HardDrive size={16} />
              Memory
            </button>
            <button
              id="snippets-nav-link"
              type="button"
              className={cn(
                'w-full text-left px-2 py-2 rounded transition-colors flex items-center gap-2',
                activeSettingsTab === 'snippets'
                  ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                  : 'hover:bg-[var(--sidebar-accent)]',
              )}
              onClick={() => router.push('/snippets')}
            >
              <FileText size={16} />
              Snippets
            </button>
            <button
              type="button"
              className={cn(
                'w-full text-left px-2 py-2 rounded transition-colors flex items-center gap-2',
                activeSettingsTab === 'profile'
                  ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                  : 'hover:bg-[var(--sidebar-accent)]',
              )}
              onClick={() => router.push('/profile')}
            >
              <UserCircle size={16} />
              Profile
            </button>
            <div className="flex items-center gap-2 px-2 py-2 text-muted-foreground">
              <BookOpen size={16} />
              Preferences
            </div>
            <div className="flex items-center gap-2 px-2 py-2 text-muted-foreground">
              <Archive size={16} />
              Archive
            </div>
          </div>

          {/* Patient section - always below settings */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Patient list header */}
            <div className="px-4 py-4 text-xs font-semibold text-[var(--sidebar-accent-foreground)] uppercase tracking-wider">
              Patients
            </div>

            {/* Scrollable patient list */}
            <div className="flex-1 overflow-y-auto px-2">
              <ul className="space-y-1 pb-4">
                {(patients || []).map(p => (
                  <li key={p.id} className="list-none">
                    <div
                      className={cn(
                        'w-full px-2 py-2 rounded transition-colors outline-none flex items-center gap-2 group',
                        currentPatientId === p.id
                          ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]'
                          : 'hover:bg-[var(--sidebar-accent)]',
                      )}
                    >
                      <button
                        type="button"
                        className="flex items-center gap-2 flex-1 text-left cursor-pointer min-w-0 w-full"
                        onClick={() => {
                          setCurrentPatientId(p.id);
                        }}
                      >
                        <User size={18} className="flex-shrink-0" />
                        <div className="flex flex-col overflow-hidden flex-1 min-w-0 w-full">
                          <div className="font-medium text-base leading-tight flex items-center gap-2 min-w-0 w-full">
                            <span className="truncate flex-1 min-w-0">{p.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate whitespace-nowrap overflow-hidden w-full min-w-0">{p.context?.replace(/\n/g, ' ')}</div>
                        </div>
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500 hover:text-white rounded text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePatient(p.id, p.name);
                        }}
                        title={`Delete ${p.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
