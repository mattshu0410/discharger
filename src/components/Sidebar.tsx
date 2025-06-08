'use client';
import type { Patient } from '@/types';
import { getAllPatients } from '@/api/patients/hooks';
import { Button } from '@/components/ui/button';
import { cn } from '@/libs/utils';
import { usePatientStore } from '@/stores/patientStore';
import { useUIStore } from '@/stores/uiStore';
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
} from '@mynaui/icons-react';
import { useQuery } from '@tanstack/react-query';

export function Sidebar() {
  const currentPatientId = usePatientStore(state => state.currentPatientId);
  const setCurrentPatientId = usePatientStore(state => state.setCurrentPatientId);
  const createNewPatient = usePatientStore(state => state.createNewPatient);

  // UI state from the new UI store
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const activeView = useUIStore(state => state.activeView);
  const setActiveView = useUIStore(state => state.setActiveView);
  const activeSettingsTab = useUIStore(state => state.activeSettingsTab);
  const setActiveSettingsTab = useUIStore(state => state.setActiveSettingsTab);

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ['getPatients'],
    queryFn: () => getAllPatients(),
  });

  const handleSettingsNavigation = (tab: 'memory' | 'snippets' | 'profile') => {
    setActiveView('settings');
    setActiveSettingsTab(tab);
  };

  return (
    <div
      className={cn(
        'h-full transition-all duration-300 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] flex flex-col',
        isSidebarOpen ? 'w-64 min-w-[16rem]' : 'w-12 min-w-[3rem]',
      )}
    >
      {/* Toggle button */}
      <button
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
                  onClick={() => setActiveView('patients')}
                  className="flex items-center gap-2"
                >
                  <User size={16} />
                  Patients
                </Button>
                <Button
                  variant={activeView === 'settings' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('settings')}
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
                    <ul className="space-y-1">
                      {patients?.map(p => (
                        <li key={p.id} className="list-none">
                          <button
                            type="button"
                            className={cn(
                              'w-full text-left px-4 py-2 cursor-pointer rounded transition-colors outline-none flex items-center gap-2',
                              currentPatientId === p.id
                                ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]'
                                : 'hover:bg-[var(--sidebar-accent)]',
                            )}
                            onClick={() => {
                              setCurrentPatientId(p.id);
                              setActiveView('patients'); // Ensure we're on patients view
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
                  </>
                )
              : (
                  <div className="px-4 py-2 space-y-2">
                    <div className="text-xs font-semibold text-[var(--sidebar-accent-foreground)] uppercase tracking-wider">
                      Settings
                    </div>
                    <button
                      className={cn(
                        'w-full text-left px-2 py-2 rounded transition-colors flex items-center gap-2',
                        activeSettingsTab === 'memory'
                          ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                          : 'hover:bg-[var(--sidebar-accent)]',
                      )}
                      onClick={() => handleSettingsNavigation('memory')}
                    >
                      <HardDrive size={16} />
                      Memory
                    </button>
                    <button
                      className={cn(
                        'w-full text-left px-2 py-2 rounded transition-colors flex items-center gap-2',
                        activeSettingsTab === 'snippets'
                          ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                          : 'hover:bg-[var(--sidebar-accent)]',
                      )}
                      onClick={() => handleSettingsNavigation('snippets')}
                    >
                      <FileText size={16} />
                      Snippets
                    </button>
                    <button
                      className={cn(
                        'w-full text-left px-2 py-2 rounded transition-colors flex items-center gap-2',
                        activeSettingsTab === 'profile'
                          ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                          : 'hover:bg-[var(--sidebar-accent)]',
                      )}
                      onClick={() => handleSettingsNavigation('profile')}
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
