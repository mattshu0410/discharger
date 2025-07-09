'use client';
import {
  Archive,
  BookOpen,
  FileText,
  HardDrive,
  Menu,
  PanelLeft,
  Plus,
  Settings,
  SidebarClose,
  User,
  UserCircle,
  X,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDeletePatient, usePatients } from '@/api/patients/queries';
import { Button } from '@/components/ui/button';
import { useCreatePatientFlow } from '@/hooks/useCreatePatientFlow';
import { cn } from '@/libs/utils';
import { usePatientStore } from '@/stores/patientStore';
import { useUIStore } from '@/stores/uiStore';

export function Sidebar() {
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

            // If the deleted patient was currently selected, switch to the first available patient
            if (currentPatientId === patientId) {
              // Get the updated patient list after deletion
              const remainingPatients = (patients || []).filter(p => p.id !== patientId);

              if (remainingPatients.length > 0) {
                // Set the first patient as the current patient
                const firstPatient = remainingPatients[0];
                if (firstPatient?.id) {
                  setCurrentPatientId(firstPatient.id);
                }
              } else {
                // No patients left, clear the selection
                setCurrentPatientId(null);
              }
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

  // Derive navigation state from URL (Single Source of Truth)
  const activeView = pathname === '/' ? 'patients' : 'settings';
  const activeSettingsTab
    = pathname === '/memory'
      ? 'memory'
      : pathname === '/snippets'
        ? 'snippets'
        : pathname === '/profile'
          ? 'profile'
          : 'memory'; // default

  return (
    <div
      id="sidebar"
      className={cn(
        'h-full transition-all duration-300 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] flex flex-col',
        isSidebarOpen ? 'w-64 min-w-[16rem]' : 'w-12 min-w-[3rem]',
      )}
    >
      {/* Toggle button */}
      <Button
        id="sidebar-toggle"
        variant="ghost"
        size="icon"
        className="m-2 h-8 w-8 hover:bg-[var(--sidebar-accent)]"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <SidebarClose size={20} /> : <PanelLeft size={20} />}
      </Button>

      <div className="flex-1 overflow-y-auto">
        {isSidebarOpen && (
          <>
            {/* View switcher */}
            <div className="px-4 py-2 border-b border-[var(--sidebar-border)]">
              <div className="flex gap-2">
                <Button
                  variant={activeView === 'patients' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    // console.warn('Navigating to patients page');
                    router.push('/');
                  }}
                  className="flex items-center gap-2"
                >
                  <User size={16} />
                  Patients
                </Button>
                <Button
                  variant={activeView === 'settings' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => router.push('/memory')}
                  className="flex items-center gap-2"
                >
                  <Settings size={16} />
                  Settings
                </Button>
              </div>
            </div>

            {activeView === 'patients'
              ? (
                  <>
                    {/* New Patient Button */}
                    <div className="px-4 py-2">
                      <Button
                        id="new-patient-btn"
                        className="w-full justify-start"
                        size="sm"
                        onClick={createNewPatient}
                        disabled={isCreating}
                      >
                        <Plus size={16} className="mr-2" />
                        New Patient
                      </Button>
                    </div>

                    <div className="px-4 py-2 text-xs font-semibold text-[var(--sidebar-accent-foreground)] uppercase tracking-wider flex items-center gap-2">
                      <Menu size={16} />
                      Patients
                    </div>
                    <ul className="space-y-1">
                      {(patients || []).map(p => (
                        <li key={p.id} className="list-none">
                          <div
                            className={cn(
                              'w-full px-4 py-2 rounded transition-colors outline-none flex items-center gap-2 group',
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
                                router.push('/');
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 hover:bg-red-500 hover:text-white text-muted-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePatient(p.id, p.name);
                              }}
                              title={`Delete ${p.name}`}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )
              : (
                  <div className="px-4 py-2 space-y-2">
                    <div className="text-xs font-semibold text-[var(--sidebar-accent-foreground)] uppercase tracking-wider">
                      Settings
                    </div>
                    <Button
                      id="memory-nav-link"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'w-full justify-start px-2 py-2 h-auto',
                        activeSettingsTab === 'memory'
                          ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                          : 'hover:bg-[var(--sidebar-accent)]',
                      )}
                      onClick={() => router.push('/memory')}
                    >
                      <HardDrive size={16} />
                      Memory
                    </Button>
                    <Button
                      id="snippets-nav-link"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'w-full justify-start px-2 py-2 h-auto',
                        activeSettingsTab === 'snippets'
                          ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                          : 'hover:bg-[var(--sidebar-accent)]',
                      )}
                      onClick={() => router.push('/snippets')}
                    >
                      <FileText size={16} />
                      Snippets
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'w-full justify-start px-2 py-2 h-auto',
                        activeSettingsTab === 'profile'
                          ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                          : 'hover:bg-[var(--sidebar-accent)]',
                      )}
                      onClick={() => router.push('/profile')}
                    >
                      <UserCircle size={16} />
                      Profile
                    </Button>
                    <div className="flex items-center gap-2 px-2 py-2 text-muted-foreground">
                      <BookOpen size={16} />
                      Preferences
                    </div>
                    <div className="flex items-center gap-2 px-2 py-2 text-muted-foreground">
                      <Archive size={16} />
                      Archive
                    </div>
                  </div>
                )}
          </>
        )}
      </div>
    </div>
  );
}
