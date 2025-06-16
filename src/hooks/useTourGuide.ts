import { useUser } from '@clerk/nextjs';
import { TourGuideClient } from '@sjmc11/tourguidejs';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useSupabaseClient } from '@/libs/supabase-client';
import { tourOptions, tourSteps } from '@/libs/tourguide/config';

export function useTourGuide() {
  const tourRef = useRef<TourGuideClient | null>(null);
  const [tourStarted, setTourStarted] = useState(false);
  const { user } = useUser();
  const supabase = useSupabaseClient();

  // Check if user has completed onboarding
  const checkOnboardingStatus = async () => {
    if (!user) {
      return true;
    } // Don't show tour if no user

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      return data?.onboarding_completed ?? false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return true; // Default to completed if there's an error
    }
  };

  // Mark onboarding as completed
  const markOnboardingCompleted = async () => {
    if (!user) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
    }
  };

  // Initialize tour
  const initializeTour = async () => {
    // Check if user has already completed onboarding
    const hasCompleted = await checkOnboardingStatus();
    if (hasCompleted) {
      return;
    }

    // Create tour instance
    const tg = new TourGuideClient({
      ...tourOptions,
      steps: tourSteps,
    });

    // Set up event handlers
    tg.onFinish(async () => {
      await markOnboardingCompleted();
      setTourStarted(false);
      toast.success('Welcome to Discharger! 🎉');
    });

    tg.onAfterExit(async () => {
      // Ask user if they want to mark as completed even if they exited early
      toast('Tour exited early', {
        description: 'Do you want to skip the tour? You can always replay it from your profile settings.',
        action: {
          label: 'Skip Tour',
          onClick: async () => {
            await markOnboardingCompleted();
          },
        },
        cancel: {
          label: 'Keep Showing',
          onClick: () => {
            // Do nothing, tour will continue to show for new visits
          },
        },
      });
      setTourStarted(false);
    });

    tourRef.current = tg;
  };

  // Start the tour
  const startTour = async () => {
    if (!tourRef.current) {
      await initializeTour();
    }

    if (tourRef.current) {
      await tourRef.current.start('onboarding');
      setTourStarted(true);
    }
  };

  // Manually trigger tour (for settings page)
  const replayTour = async () => {
    // Reset any existing tour
    if (tourRef.current) {
      await tourRef.current.exit();
      tourRef.current = null;
    }

    // Create fresh tour instance
    const tg = new TourGuideClient({
      ...tourOptions,
      steps: tourSteps,
      completeOnFinish: false, // Don't mark as complete when replaying
    });

    tg.onFinish(() => {
      setTourStarted(false);
      toast.success('Tour completed!');
    });

    tg.onAfterExit(() => {
      setTourStarted(false);
    });

    tourRef.current = tg;
    await tourRef.current.start('onboarding');
    setTourStarted(true);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (tourRef.current && tourRef.current.isVisible) {
        tourRef.current.exit();
      }
    };
  }, []);

  return {
    startTour,
    replayTour,
    tourStarted,
    initializeTour,
  };
}
