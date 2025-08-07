'use client';

import { useUser } from '@clerk/nextjs';
import { useNextStep } from 'nextstepjs';
import { useEffect } from 'react';
import { useUserProfile } from '@/api/users/queries';

export function useOnboarding() {
  const { user } = useUser();
  const { data: userProfile } = useUserProfile();
  const { startNextStep } = useNextStep();

  useEffect(() => {
    // Only start tour if user is authenticated, has profile data, and hasn't completed the tour
    if (user && userProfile && userProfile.onboarding_completed && !userProfile.tour_completed) {
      console.warn('Starting onboarding tour in 1 second...');
      // Start the onboarding tour with delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        console.warn('Calling startNextStep with "onboarding"');
        startNextStep('onboarding');
      }, 1000);
      return () => clearTimeout(timeoutId);
    } else {
      return undefined;
    }
  }, [user, userProfile, startNextStep]);
  return {
    isTourCompleted: userProfile?.tour_completed ?? false,
    isOnboardingCompleted: userProfile?.onboarding_completed ?? false,
  };
}
