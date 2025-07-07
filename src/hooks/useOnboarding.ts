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
    // Only check onboarding if user is authenticated and we have profile data
    if (user && userProfile && !userProfile.onboarding_completed) {
      console.warn('Starting onboarding tour in 1 second...');
      // Start the onboarding tour with delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        console.warn('Calling startNextStep with "onboarding"');
        // startNextStep('onboarding');
      }, 1000);
      return () => clearTimeout(timeoutId);
    } else {
      console.warn('Onboarding not started');
      return undefined;
    }
  }, [user, userProfile, startNextStep]);
  return {
    isOnboardingCompleted: userProfile?.onboarding_completed ?? true,
  };
}
