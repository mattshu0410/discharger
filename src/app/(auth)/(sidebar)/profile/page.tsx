'use client';
import { useClerk, UserProfile, useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { Award, Building2, Calendar, Check, ChevronsUpDown, LogOut, Mail, Monitor, Moon, Settings, Stethoscope, Sun, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useHospitals } from '@/api/hospitals/queries';
import {
  useResetTour,
  useUpdateDepartment,
  useUpdateExemplarReport,
  useUpdateHospital,
  useUpdatePreferences,
  useUpdateTitle,
  useUserProfile,
} from '@/api/users/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useClinicalDepartments, useMedicalTitles } from '@/libs/csv-data';

import { cn } from '@/libs/utils';

export default function ProfilePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const { data: hospitals, isLoading: isLoadingHospitals } = useHospitals();
  const { titles: medicalTitles, loading: loadingTitles } = useMedicalTitles();
  const { departments: clinicalDepartments, loading: loadingDepartments } = useClinicalDepartments();

  // Debug logging
  console.warn('User Profile:', userProfile);
  console.warn('Hospitals:', hospitals);
  console.warn('User Hospital ID:', userProfile?.hospitalId);
  console.warn('Found Hospital:', hospitals?.find(hospital => hospital.id === userProfile?.hospitalId));
  // Mutations
  const updatePreferences = useUpdatePreferences();
  const updateTitle = useUpdateTitle();
  const updateDepartment = useUpdateDepartment();
  const updateHospital = useUpdateHospital();
  const updateExemplarReport = useUpdateExemplarReport();
  const resetTour = useResetTour();
  const { setPersonProperties } = useAnalytics();

  const [showUserProfile, setShowUserProfile] = useState(false);
  const [openDepartment, setOpenDepartment] = useState(false);
  const [openHospital, setOpenHospital] = useState(false);
  const [exemplarReport, setExemplarReport] = useState('');

  // Update exemplar report state when userProfile changes
  useEffect(() => {
    if (userProfile?.exemplar_report !== undefined) {
      const newValue = userProfile.exemplar_report || '';
      setExemplarReport(newValue);
    }
  }, [userProfile?.exemplar_report]);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      await updatePreferences.mutateAsync({
        ...userProfile?.preferences,
        theme: newTheme,
      });
      toast.success('Theme updated successfully');
    } catch {
      toast.error('Failed to update theme');
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    try {
      await updateTitle.mutateAsync(newTitle);
      setPersonProperties({ title: newTitle });
      toast.success('Title updated successfully');
    } catch {
      toast.error('Failed to update title');
    }
  };

  const handleDepartmentChange = async (newDepartment: string) => {
    try {
      await updateDepartment.mutateAsync(newDepartment);
      setPersonProperties({ department: newDepartment });
      toast.success('Department updated successfully');
    } catch {
      toast.error('Failed to update department');
    }
  };

  const handleHospitalChange = async (newHospitalId: string) => {
    try {
      await updateHospital.mutateAsync(newHospitalId);
      const selectedHospital = hospitals?.find(h => h.id === newHospitalId);
      setPersonProperties({
        hospital_id: newHospitalId,
        hospital_name: selectedHospital?.name,
        hospital_district: selectedHospital?.local_health_district,
      });
      toast.success('Hospital updated successfully');
    } catch {
      toast.error('Failed to update hospital');
    }
  };

  const handleExemplarReportChange = async () => {
    try {
      await updateExemplarReport.mutateAsync(exemplarReport);
      toast.success('Exemplar report updated successfully');
    } catch {
      toast.error('Failed to update exemplar report');
    }
  };

  const handleResetTour = async () => {
    try {
      await resetTour.mutateAsync();
      toast.success('Tour reset successfully! Visit the discharge page to see the tour again.');
    } catch {
      toast.error('Failed to reset tour');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  };

  if (!isUserLoaded || isProfileLoading || loadingTitles || loadingDepartments) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-6 pb-0">
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-6">
        <div className="space-y-6 pb-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{user?.primaryEmailAddress?.emailAddress || 'No email available'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Display Name
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{user?.fullName || user?.firstName || 'No name set'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Account Created
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">
                      {user?.createdAt ? format(new Date(user.createdAt), 'PPP') : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Last Sign In
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">
                      {user?.lastSignInAt ? format(new Date(user.lastSignInAt), 'PPP') : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-4 w-4" />
                Professional Information
              </CardTitle>
              <CardDescription>
                Your medical credentials and workplace details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Medical Title */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Medical Title
                  </Label>
                  <Select
                    value={userProfile?.title || ''}
                    onValueChange={handleTitleChange}
                    disabled={updateTitle.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your title" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicalTitles.map(title => (
                        <SelectItem key={title.name} value={title.name}>
                          {title.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Department
                  </Label>
                  <Popover open={openDepartment} onOpenChange={setOpenDepartment}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openDepartment}
                        className="w-full justify-between"
                        disabled={updateDepartment.isPending}
                      >
                        {userProfile?.department
                          ? clinicalDepartments.find(dept => dept.department === userProfile.department)?.department
                          : 'Select your department'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search departments..." />
                        <CommandList className="max-h-60">
                          <CommandEmpty>No department found.</CommandEmpty>
                          {Object.entries(
                            clinicalDepartments.reduce((acc, { category, department }) => {
                              if (!acc[category]) {
                                acc[category] = [];
                              }
                              acc[category].push(department);
                              return acc;
                            }, {} as Record<string, string[]>),
                          ).map(([category, departments]) => (
                            <CommandGroup key={category} heading={category}>
                              {departments.map(department => (
                                <CommandItem
                                  key={department}
                                  value={department}
                                  onSelect={(currentValue) => {
                                    handleDepartmentChange(currentValue);
                                    setOpenDepartment(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      userProfile?.department === department ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  {department}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Hospital */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Hospital
                </Label>
                <Popover open={openHospital} onOpenChange={setOpenHospital}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openHospital}
                      className="w-full justify-between"
                      disabled={updateHospital.isPending || isLoadingHospitals}
                    >
                      {userProfile?.hospitalId
                        ? hospitals?.find(hospital => hospital.id === userProfile.hospitalId)?.name
                        : 'Select your hospital'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search hospitals..." />
                      <CommandList className="max-h-60">
                        <CommandEmpty>
                          {isLoadingHospitals ? 'Loading hospitals...' : 'No hospital found.'}
                        </CommandEmpty>
                        {hospitals && Object.entries(
                          hospitals.reduce((acc, hospital) => {
                            const lhd = hospital.local_health_district;
                            if (!acc[lhd]) {
                              acc[lhd] = [];
                            }
                            acc[lhd].push(hospital);
                            return acc;
                          }, {} as Record<string, typeof hospitals>),
                        ).map(([lhd, lhdHospitals]) => (
                          <CommandGroup key={lhd} heading={lhd}>
                            {lhdHospitals.map(hospital => (
                              <CommandItem
                                key={hospital.id}
                                value={`${hospital.name} ${hospital.local_health_district}`}
                                onSelect={() => {
                                  handleHospitalChange(hospital.id);
                                  setOpenHospital(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    userProfile?.hospitalId === hospital.id ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{hospital.name}</span>
                                  <span className="text-xs text-muted-foreground">{hospital.local_health_district}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {isLoadingHospitals && (
                  <p className="text-sm text-muted-foreground">Loading hospitals...</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Exemplar Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-4 w-4" />
                Exemplar Report
              </CardTitle>
              <CardDescription>
                Provide an example of a high-quality discharge summary to help guide the AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={exemplarReport}
                onChange={e => setExemplarReport(e.target.value)}
                rows={10}
                placeholder="Paste your exemplar report here..."
              />
              <Button
                onClick={handleExemplarReportChange}
                disabled={updateExemplarReport.isPending}
              >
                {updateExemplarReport.isPending ? 'Saving...' : 'Save Exemplar Report'}
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-4 w-4" />
                Preferences
              </CardTitle>
              <CardDescription>
                Customize your experience with Discharger.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={userProfile?.preferences.theme || 'system'} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select theme">
                      {userProfile?.preferences.theme === 'light' && (
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      )}
                      {userProfile?.preferences.theme === 'dark' && (
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      )}
                      {(!userProfile?.preferences.theme || userProfile?.preferences.theme === 'system') && (
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color scheme.
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Account Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Management</CardTitle>
              <CardDescription>
                Manage your account settings and security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUserProfile(true)}
                >
                  Manage Account Settings
                </Button>
                <p className="text-sm text-muted-foreground">
                  Update your password, security settings, and more.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={handleResetTour}
                  disabled={resetTour.isPending}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {resetTour.isPending ? 'Resetting Tour...' : 'Reset App Tour'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Reset the interactive tour to see it again on the discharge page.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account and return to the login page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Profile Modal */}
      {showUserProfile && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setShowUserProfile(false)}
          onKeyDown={e => e.key === 'Escape' && setShowUserProfile(false)}
          role="button"
          aria-label="Close modal"
          tabIndex={0}
        >
          <div
            className="overflow-y-auto"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            <UserProfile
              routing="hash"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0 bg-transparent',
                  navbar: 'hidden',
                  pageScrollBox: 'padding: 0',
                  page: 'padding: 24px',
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
