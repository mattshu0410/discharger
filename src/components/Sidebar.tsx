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
} from '@mynaui/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { usePatients } from '@/api/patients/queries';
import { Button } from '@/components/ui/button';
import { cn } from '@/libs/utils';
import { usePatientStore } from '@/stores/patientStore';
import { useUIStore } from '@/stores/uiStore';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPatientId = usePatientStore(state => state.currentPatientId);
  const setCurrentPatientId = usePatientStore(state => state.setCurrentPatientId);
  const createNewPatient = usePatientStore(state => state.createNewPatient);

  // Check if this is a new/temporary patient
  const isNewPatient = currentPatientId && typeof currentPatientId === 'string' && currentPatientId.startsWith('new-');

  // UI state from the new UI store (only non-navigation state)
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);

  const { data: patients } = usePatients();

  // Create temporary patient entry for the sidebar
  const temporaryPatient = isNewPatient
    ? {
        id: currentPatientId!,
        name: 'New Patient',
        context: 'Creating new patient...',
        isTemporary: true,
      }
    : null;

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
                    console.warn('Navigating to patients page');
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
                    <ul className="space-y-1">
                      {allPatients.map(p => (
                        <li key={p.id} className="list-none">
                          <button
                            type="button"
                            className={cn(
                              'w-full text-left px-4 py-2 cursor-pointer rounded transition-colors outline-none flex items-center gap-2',
                              currentPatientId === p.id
                                ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]'
                                : 'hover:bg-[var(--sidebar-accent)]',
                              // Special styling for temporary patient
                              'isTemporary' in p && p.isTemporary && 'border-2 border-dashed border-yellow-400/50 bg-yellow-50/10',
                            )}
                            onClick={() => {
                              setCurrentPatientId(p.id);
                              router.push('/');
                            }}
                          >
                            {/* Different icon for temporary patient */}
                            {'isTemporary' in p && p.isTemporary
                              ? (
                                  <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center">
                                    <Plus size={10} className="text-yellow-800" />
                                  </div>
                                )
                              : (
                                  <User size={18} />
                                )}
                            <div className="flex flex-col overflow-hidden flex-1">
                              <div className="font-medium text-base leading-tight flex items-center gap-2">
                                {p.name}
                                {'isTemporary' in p && p.isTemporary && (
                                  <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full border">
                                    Temp
                                  </span>
                                )}
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
