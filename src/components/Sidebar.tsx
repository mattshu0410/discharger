'use client';
import {
  BookOpen,
  Cog,
  Database,
  FileText,
  HardDrive,
  Menu,
  PanelLeft,
  Plus,
  SidebarAlt,
  User,
  UserCircle,
  X,
} from '@mynaui/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useDocumentsByIds } from '@/api/documents/queries';
import { useDeletePatient, usePatient, usePatients } from '@/api/patients/queries';
import { Button } from '@/components/ui/button';
import { cn } from '@/libs/utils';
import { useDischargeSummaryStore } from '@/stores';
import { usePatientStore } from '@/stores/patientStore';
import { useUIStore } from '@/stores/uiStore';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPatientId = usePatientStore(state => state.currentPatientId);
  const setCurrentPatientId = usePatientStore(state => state.setCurrentPatientId);
  const createNewPatient = usePatientStore(state => state.createNewPatient);
  const addDocumentsFromGeneration = usePatientStore(state => state.addDocumentsFromGeneration);

  // Discharge summary store
  const setDischargeSummary = useDischargeSummaryStore(state => state.setDischargeSummary);
  const clearSummary = useDischargeSummaryStore(state => state.clearSummary);

  // Check if this is a new/temporary patient
  const isNewPatient = currentPatientId && typeof currentPatientId === 'string' && currentPatientId.startsWith('new-');

  // UI state from the new UI store (only non-navigation state)
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);

  const { data: patients } = usePatients();
  const deletePatientMutation = useDeletePatient();

  // Create temporary patient entry for the sidebar
  const temporaryPatient = isNewPatient
    ? {
        id: currentPatientId!,
        name: 'New Patient',
        context: 'Creating new patient...',
        isTemporary: true,
      }
    : null;

  // Fetch patient data when currentPatientId changes (to load discharge summary)
  const { data: currentPatientData } = usePatient(currentPatientId || '');

  // Fetch documents when patient has saved document IDs
  const savedDocumentIds = currentPatientData?.document_ids || [];
  const { data: savedDocuments = [] } = useDocumentsByIds(savedDocumentIds);

  // Load discharge summary and documents when patient data is fetched
  useEffect(() => {
    if (currentPatientData && !isNewPatient) {
      // Load discharge summary if it exists
      if (currentPatientData.discharge_text) {
        try {
          const dischargeSummary = JSON.parse(currentPatientData.discharge_text);
          setDischargeSummary(dischargeSummary);
          // console.warn('Loaded discharge summary from Supabase');
        } catch (parseError) {
          console.error('Failed to parse discharge summary:', parseError);
        }
      }

      // Load saved documents when they're fetched
      if (savedDocuments.length > 0) {
        addDocumentsFromGeneration(savedDocuments);
        // console.warn('Loaded saved documents for patient:', savedDocuments.map(d => d.filename));
      }
    }
  }, [currentPatientData, savedDocuments, setDischargeSummary, isNewPatient, addDocumentsFromGeneration]);

  // Clear discharge summary when switching patients
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts or patient changes
      clearSummary();
    };
  }, [currentPatientId, clearSummary]);

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

  // Combine temporary patient with existing patients
  const allPatients = temporaryPatient
    ? [temporaryPatient, ...(patients || [])]
    : (patients || []);

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
      className={cn(
        'h-full transition-all duration-300 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] flex flex-col',
        isSidebarOpen ? 'w-64 min-w-[16rem]' : 'w-12 min-w-[3rem]',
      )}
    >
      {/* Toggle button */}
      <button
        type="button"
        className="m-2 p-1 rounded hover:bg-[var(--sidebar-accent)] transition-colors"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <SidebarAlt size={20} /> : <PanelLeft size={20} />}
      </button>

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
                  <Cog size={16} />
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
                        className="w-full justify-start"
                        size="sm"
                        onClick={() => {
                          createNewPatient();
                          router.push('/');
                        }}
                      >
                        <Plus size={16} className="mr-2" />
                        New Patient
                      </Button>
                    </div>

                    <div className="px-4 py-2 text-xs font-semibold text-[var(--sidebar-accent-foreground)] uppercase tracking-wider flex items-center gap-2">
                      <Menu size={16} />
                      Patients
                    </div>
                    <ul className="space-y-1" data-tour="patient-list">
                      {allPatients.map(p => (
                        <li key={p.id} className="list-none">
                          <div
                            className={cn(
                              'w-full px-4 py-2 rounded transition-colors outline-none flex items-center gap-2 group',
                              currentPatientId === p.id
                                ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]'
                                : 'hover:bg-[var(--sidebar-accent)]',
                              // Special styling for temporary patient
                              'isTemporary' in p && p.isTemporary && 'border-2 border-dashed border-yellow-400/50 bg-yellow-50/10',
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
                              {/* Different icon for temporary patient */}
                              {'isTemporary' in p && p.isTemporary
                                ? (
                                    <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center flex-shrink-0">
                                      <Plus size={10} className="text-yellow-800" />
                                    </div>
                                  )
                                : (
                                    <User size={18} className="flex-shrink-0" />
                                  )}
                              <div className="flex flex-col overflow-hidden flex-1 min-w-0 w-full">
                                <div className="font-medium text-base leading-tight flex items-center gap-2 min-w-0 w-full">
                                  <span className="truncate flex-1 min-w-0">{p.name}</span>
                                  {'isTemporary' in p && p.isTemporary && (
                                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full border flex-shrink-0">
                                      Temp
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate whitespace-nowrap overflow-hidden w-full min-w-0">{p.context?.replace(/\n/g, ' ')}</div>
                              </div>
                            </button>

                            {/* Delete button - only show for non-temporary patients */}
                            {!('isTemporary' in p && p.isTemporary) && (
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
                            )}
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
                    <button
                      type="button"
                      className={cn(
                        'w-full text-left px-2 py-2 rounded transition-colors flex items-center gap-2',
                        activeSettingsTab === 'memory'
                          ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                          : 'hover:bg-[var(--sidebar-accent)]',
                      )}
                      onClick={() => router.push('/memory')}
                      data-tour="memory-link"
                    >
                      <HardDrive size={16} />
                      Memory
                    </button>
                    <button
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
                      <Database size={16} />
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
