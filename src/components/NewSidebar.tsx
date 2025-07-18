'use client';
import { useClerk, useUser } from '@clerk/nextjs';
import {
  FileDown,
  FileText,
  HardDrive,
  LogOut,
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
import { useUserProfile } from '@/api/users/queries';
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

  // Clerk auth
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data: userProfile } = useUserProfile();

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

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out failed:', error);
      toast.error('Failed to sign out. Please try again.');
    }
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
      <div className={cn(
        'flex items-center gap-2 p-3 border-b border-[var(--sidebar-border)]',
        !isSidebarOpen && 'justify-center',
      )}
      >
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
        <Button
          id="sidebar-toggle"
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0 hover:bg-[var(--sidebar-accent)]"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <SidebarClose size={20} /> : <PanelLeft size={20} />}
        </Button>
      </div>

      {isSidebarOpen && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Workflows section - new section at top */}
          <div className="px-4 py-4 space-y-2 border-b border-[var(--sidebar-border)]">
            <div className="text-xs font-semibold text-[var(--sidebar-accent-foreground)] uppercase tracking-wider mb-2">
              Workflows
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start px-2 py-2 h-auto',
                pathname === '/'
                  ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                  : 'hover:bg-[var(--sidebar-accent)]',
              )}
              onClick={() => router.push('/')}
            >
              <Zap size={16} className="mr-2" />
              Auto-Discharge
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start px-2 py-2 h-auto',
                pathname === '/composer'
                  ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                  : 'hover:bg-[var(--sidebar-accent)]',
              )}
              onClick={() => router.push('/composer')}
            >
              <FileDown size={16} className="mr-2" />
              Discharge Simplifier
            </Button>
          </div>

          {/* Settings section - now below workflows */}
          <div className="px-4 py-4 space-y-2 border-b border-[var(--sidebar-border)]">
            <div className="text-xs font-semibold text-[var(--sidebar-accent-foreground)] uppercase tracking-wider mb-2">
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
              <HardDrive size={16} className="mr-2" />
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
              <FileText size={16} className="mr-2" />
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
              <UserCircle size={16} className="mr-2" />
              Profile
            </Button>
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
            </div>
          </div>

          {/* Profile section - always at bottom */}
          <div className="mt-auto border-t border-[var(--sidebar-border)] p-4">
            <div className="flex items-center gap-3">
              {/* Profile picture and user info - clickable */}
              <Button
                variant="ghost"
                className="flex items-center gap-3 flex-1 min-w-0 h-auto p-2 justify-start hover:bg-transparent"
                onClick={() => router.push('/profile')}
              >
                {/* Profile picture */}
                <div className="w-10 h-10 rounded-full bg-[var(--sidebar-accent)] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user?.imageUrl
                    ? (
                        <img
                          src={user.imageUrl}
                          alt={user.fullName || 'Profile'}
                          className="w-full h-full object-cover"
                        />
                      )
                    : (
                        <UserCircle className="w-6 h-6 text-[var(--sidebar-accent-foreground)]" />
                      )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium text-sm truncate">
                    {user?.fullName || user?.firstName || 'User'}
                  </div>
                  <div className="text-xs text-[var(--sidebar-accent-foreground)] truncate">
                    {userProfile?.title || 'Doctor'}
                  </div>
                </div>
              </Button>

              {/* Sign out button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                onClick={handleSignOut}
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
