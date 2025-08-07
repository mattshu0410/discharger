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

  const handleComplete = async (_tourName: string | null) => {
    if (userProfile) {
      try {
        await updateProfile.mutateAsync({
          tour_completed: true,
        });
      } catch (error) {
        console.error('Failed to update tour completion status:', error);
      }
    }
  };

  const handleSkip = async (_step: number, _tourName: string | null) => {
    if (userProfile) {
      try {
        await updateProfile.mutateAsync({
          tour_completed: true,
        });
      } catch (error) {
        console.error('Failed to update tour completion status:', error);
      }
    }
  };

  return (
    <NextStep
      steps={steps as any}
      onComplete={handleComplete}
      onSkip={handleSkip}
    >
      {children}
    </NextStep>
  );
}
