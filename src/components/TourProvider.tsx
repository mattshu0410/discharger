'use client';

import { NextStep } from 'nextstepjs';
import { useCurrentUser, useUpdateProfile } from '@/api/users/queries';
import steps from '@/libs/onboarding-steps';

type TourProviderProps = {
  children: React.ReactNode;
};

export function TourProvider({ children }: TourProviderProps) {
  const { data: userProfile } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const handleComplete = async (tourName: string | null) => {
    console.warn('handleComplete called with tour:', tourName);
    if (userProfile) {
      try {
        console.warn('Updating onboarding status to true');
        await updateProfile.mutateAsync({
          ...userProfile,
          onboarding_completed: true,
        });
        console.warn('Onboarding status updated successfully');
      } catch (error) {
        console.error('Failed to update onboarding status:', error);
      }
    } else {
      console.warn('No userProfile available for onboarding completion');
    }
  };

  console.warn('TourProvider rendering with steps:', steps);

  return (
    <NextStep
      steps={steps as any}
      onComplete={handleComplete}
    >
      {children}
    </NextStep>
  );
}
