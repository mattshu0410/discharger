'use client';

import { NextStep } from 'nextstepjs';
import { useCurrentUser, useUpdateProfile } from '@/api/users/queries';
import steps from '@/libs/onboarding-steps';
// import { logger } from '@/libs/Logger';

type TourProviderProps = {
  children: React.ReactNode;
};

export function TourProvider({ children }: TourProviderProps) {
  const { data: userProfile } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const handleComplete = async (_step: number, _tourName: string | null) => {
    // logger.debug('handleComplete called with tour:', tourName);
    if (userProfile) {
      try {
        // logger.debug('Updating onboarding status to true');
        await updateProfile.mutateAsync({
          ...userProfile,
          onboarding_completed: true,
        });
        // logger.debug('Onboarding status updated successfully');
      } catch (error) {
        // logger.error('Failed to update onboarding status:', error);
        console.error('Failed to update onboarding status:', error);
      }
    } else {
      // logger.debug('No userProfile available for onboarding completion');
    }
  };

  // logger.debug('TourProvider rendering with steps:', steps);

  return (
    <NextStep
      steps={steps as any}
      onSkip={handleComplete}
    >
      {children}
    </NextStep>
  );
}
