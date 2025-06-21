'use client';
import { useClerk, UserProfile, useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { Award, Building2, Calendar, Check, ChevronsUpDown, LogOut, Mail, Settings, Stethoscope, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useHospitals } from '@/api/hospitals/queries';
import {
  useUpdateDepartment,
  useUpdateHospital,
  useUpdateTitle,
  useUpdateUserPreferences,
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

import { cn } from '@/libs/utils';

export default function ProfilePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const { data: hospitals, isLoading: isLoadingHospitals } = useHospitals();
  // Mutations
  const updatePreferences = useUpdateUserPreferences();
  const updateTitle = useUpdateTitle();
  const updateDepartment = useUpdateDepartment();
  const updateHospital = useUpdateHospital();

  const [showUserProfile, setShowUserProfile] = useState(false);
  const [openDepartment, setOpenDepartment] = useState(false);
  const [openHospital, setOpenHospital] = useState(false);

  // Medical titles from CSV
  const medicalTitles = [
    'Intern',
    'Resident Medical Officer (RMO)',
    'Senior Resident Medical Officer (SRMO)',
    'Registrar',
    'Advanced Trainee',
    'Fellow',
    'Consultant (Staff Specialist)',
    'Visiting Medical Officer (VMO)',
    'Career Medical Officer (CMO)',
  ];

  // Clinical departments from CSV
  const clinicalDepartments = [
    { category: 'Medical', department: 'General Medicine / Internal Medicine' },
    { category: 'Medical', department: 'Cardiology' },
    { category: 'Medical', department: 'Endocrinology' },
    { category: 'Medical', department: 'Gastroenterology' },
    { category: 'Medical', department: 'Geriatric Medicine' },
    { category: 'Medical', department: 'Haematology' },
    { category: 'Medical', department: 'Infectious Diseases' },
    { category: 'Medical', department: 'Medical Oncology' },
    { category: 'Medical', department: 'Nephrology' },
    { category: 'Medical', department: 'Neurology' },
    { category: 'Medical', department: 'Respiratory / Pulmonology' },
    { category: 'Medical', department: 'Rheumatology' },
    { category: 'Medical', department: 'Immunology' },
    { category: 'Medical', department: 'Dermatology' },
    { category: 'Medical', department: 'Rehabilitation Medicine' },
    { category: 'Medical', department: 'Palliative Care' },
    { category: 'Medical', department: 'Pain Medicine' },
    { category: 'Medical', department: 'Clinical Pharmacology' },
    { category: 'Medical', department: 'Sleep Medicine' },
    { category: 'Surgical', department: 'General Surgery' },
    { category: 'Surgical', department: 'Cardiothoracic Surgery' },
    { category: 'Surgical', department: 'Neurosurgery' },
    { category: 'Surgical', department: 'Orthopaedic Surgery' },
    { category: 'Surgical', department: 'Plastic & Reconstructive Surgery' },
    { category: 'Surgical', department: 'ENT (Otolaryngology, Head and Neck Surgery)' },
    { category: 'Surgical', department: 'Urology' },
    { category: 'Surgical', department: 'Vascular Surgery' },
    { category: 'Surgical', department: 'Hepatobiliary Surgery' },
    { category: 'Surgical', department: 'Colorectal Surgery' },
    { category: 'Surgical', department: 'Breast Surgery' },
    { category: 'Surgical', department: 'Transplant Surgery' },
    { category: 'Surgical', department: 'Surgical Oncology' },
    { category: 'Critical Care', department: 'Emergency Medicine' },
    { category: 'Critical Care', department: 'Intensive Care (ICU)' },
    { category: 'Critical Care', department: 'Anaesthetics / Perioperative Medicine' },
    { category: 'Women\'s and Children\'s Health', department: 'Obstetrics' },
    { category: 'Women\'s and Children\'s Health', department: 'Gynaecology' },
    { category: 'Women\'s and Children\'s Health', department: 'Neonatology' },
    { category: 'Women\'s and Children\'s Health', department: 'Paediatrics' },
    { category: 'Women\'s and Children\'s Health', department: 'Paediatric Surgery' },
    { category: 'Women\'s and Children\'s Health', department: 'Maternal-Fetal Medicine' },
    { category: 'Mental Health', department: 'General Psychiatry' },
    { category: 'Mental Health', department: 'Child and Adolescent Psychiatry' },
    { category: 'Mental Health', department: 'Geriatric Psychiatry' },
    { category: 'Mental Health', department: 'Forensic Psychiatry' },
    { category: 'Mental Health', department: 'Addiction Medicine' },
    { category: 'Diagnostics', department: 'Radiology / Medical Imaging' },
    { category: 'Diagnostics', department: 'Nuclear Medicine' },
    { category: 'Diagnostics', department: 'Pathology' },
    { category: 'Diagnostics', department: 'Clinical Genetics' },
    { category: 'Diagnostics', department: 'Laboratory Medicine' },
    { category: 'Other', department: 'Sports Medicine' },
    { category: 'Other', department: 'Occupational Medicine' },
    { category: 'Other', department: 'Public Health / Preventive Medicine' },
    { category: 'Other', department: 'Hyperbaric Medicine' },
    { category: 'Other', department: 'Sexual Health / Venereology' },
    { category: 'Allied Health', department: 'Physiotherapy' },
    { category: 'Allied Health', department: 'Occupational Therapy' },
    { category: 'Allied Health', department: 'Speech Pathology' },
    { category: 'Allied Health', department: 'Dietetics / Nutrition' },
    { category: 'Allied Health', department: 'Social Work' },
    { category: 'Allied Health', department: 'Psychology' },
    { category: 'Allied Health', department: 'Pharmacy' },
  ];

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
      toast.success('Title updated successfully');
    } catch {
      toast.error('Failed to update title');
    }
  };

  const handleDepartmentChange = async (newDepartment: string) => {
    try {
      await updateDepartment.mutateAsync(newDepartment);
      toast.success('Department updated successfully');
    } catch {
      toast.error('Failed to update department');
    }
  };

  const handleHospitalChange = async (newHospitalId: string) => {
    try {
      await updateHospital.mutateAsync(newHospitalId);
      toast.success('Hospital updated successfully');
    } catch {
      toast.error('Failed to update hospital');
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

  if (!isUserLoaded || isProfileLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
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
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
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
                      <SelectItem key={title} value={title}>
                        {title}
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

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
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
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
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
            <CardTitle>Account Management</CardTitle>
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
