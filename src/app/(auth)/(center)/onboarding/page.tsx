'use client';
import { useUser } from '@clerk/nextjs';
import { Award, Building2, Check, ChevronsUpDown, Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useHospitals } from '@/api/hospitals/queries';
import { useUpdateProfile, useUserProfile } from '@/api/users/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useClinicalDepartments, useMedicalTitles } from '@/libs/csv-data';
import { cn } from '@/libs/utils';

// Default exemplar report from emergency medicine
const DEFAULT_EXEMPLAR_REPORT = `DISCHARGE SUMMARY
Diagnosis 
Chronic sciatica (Discharge)  
ADMISSION SUMMARY 
Summary of Progress 
Dear Doctor,
Thank you for your ongoing care of _____, a ____-year-old female/male who presented to the Emergency Department at ___ on ____ with chronic back pain and sciatica.
____ reported bilateral lower back pain for several months with left lower limb sciatica. They were able to mobilise independently, had no neurological deficits on examination, and had no red flags concerning for serious underlying pathology. They were advised to continue pharmacological and non-pharmacological measures to manage their pain, continue physical activity, follow up with our back pain clinic and have an MRI in late April as an outpatient as previously arranged.
DISCHARGE PLAN
1. Discharge home.
2. Please continue the following medications
- Celecoxib 100mg twice daily for 5 days
- Esomeprazole 20mg daily for 5 days
- Panadol 1g four times a day as needed for pain
3. Follow-up with lower back pain clinic on Thursday as per the provided form (Phone: XXXX XXXX to confirm appointment).
4. Please seek medical attention and/or present to your nearest emergency department if your symptoms get worse or you have any other concerns.
-Weakness in legs, unsteadiness when walking, changes to bowel or  bladder function, severe pain at night, fevers
Kind Regards,
Dr _____, Emergency Medicine JMO
On behalf of Dr _____, Emergency Medicine Consultant`;

export default function OnboardingPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const { data: hospitals, isLoading: isLoadingHospitals } = useHospitals();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const { titles: medicalTitles, loading: loadingTitles } = useMedicalTitles();
  const { departments: clinicalDepartments, loading: loadingDepartments } = useClinicalDepartments();

  const [openDepartment, setOpenDepartment] = useState(false);
  const [openHospital, setOpenHospital] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    hospitalId: '',
    exemplarReport: '',
  });

  // Redirect if user is not loaded, not authenticated, or already completed onboarding
  useEffect(() => {
    if (isUserLoaded && !user) {
      router.push('/');
    }
    if (userProfile?.onboarding_completed) {
      router.push('/discharge');
    }
  }, [isUserLoaded, user, userProfile?.onboarding_completed, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.department || !formData.hospitalId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Use the user's exemplar report if provided, otherwise use the default
      const exemplarReport = formData.exemplarReport.trim() || DEFAULT_EXEMPLAR_REPORT;

      await updateProfile.mutateAsync({
        title: formData.title,
        department: formData.department,
        hospitalId: formData.hospitalId,
        exemplar_report: exemplarReport,
        onboarding_completed: true, // Profile setup is complete
        tour_completed: false, // Tour hasn't started yet
      });

      toast.success('Profile completed successfully! Starting your tour...');
      router.push('/discharge');
    } catch {
      toast.error('Failed to complete profile');
    }
  };

  if (!isUserLoaded || isLoadingHospitals || isProfileLoading || loadingTitles || loadingDepartments) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to Discharger</CardTitle>
          <CardDescription className="text-lg">
            Loading your onboarding experience...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Welcome to Discharger</CardTitle>
        <CardDescription className="text-lg">
          Please complete your profile to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medical Title */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Medical Title *
            </Label>
            <Select
              value={formData.title}
              onValueChange={value => setFormData(prev => ({ ...prev, title: value }))}
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
              Department *
            </Label>
            <Popover open={openDepartment} onOpenChange={setOpenDepartment}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDepartment}
                  className="w-full justify-between"
                >
                  {formData.department || 'Select your department'}
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
                              setFormData(prev => ({ ...prev, department: currentValue }));
                              setOpenDepartment(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.department === department ? 'opacity-100' : 'opacity-0',
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

          {/* Hospital */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Hospital *
            </Label>
            <Popover open={openHospital} onOpenChange={setOpenHospital}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openHospital}
                  className="w-full justify-between"
                >
                  {formData.hospitalId
                    ? hospitals?.find(hospital => hospital.id === formData.hospitalId)?.name
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
                              setFormData(prev => ({ ...prev, hospitalId: hospital.id }));
                              setOpenHospital(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.hospitalId === hospital.id ? 'opacity-100' : 'opacity-0',
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

          <Separator />

          {/* Exemplar Report */}
          <div className="space-y-2">
            <Label htmlFor="exemplar_report" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Exemplar Report (Optional)
            </Label>
            <Textarea
              id="exemplar_report"
              value={formData.exemplarReport}
              onChange={e => setFormData(prev => ({ ...prev, exemplarReport: e.target.value }))}
              rows={10}
              placeholder="Paste your exemplar report here to help guide the AI..."
            />
            <p className="text-sm text-muted-foreground">
              Provide an example of a high-quality discharge summary to help guide the AI. If left empty, a default exemplar will be used.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? 'Completing Profile...' : 'Complete Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
