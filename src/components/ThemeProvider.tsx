'use client';
import { useEffect } from 'react';
import { useUserProfile } from '@/api/users/queries';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: userProfile, isLoading } = useUserProfile();

  useEffect(() => {
    // Don't apply theme until we have user data or confirmed no user
    if (isLoading) {
      console.warn('ThemeProvider: User profile is loading');
      return undefined;
    }

    const theme = userProfile?.preferences?.theme || 'system';

    const applyTheme = (theme: string) => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', systemTheme === 'dark');
      } else {
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    };

    applyTheme(theme);

    // Listen for system theme changes when theme is set to 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    return undefined;
  }, [userProfile?.preferences?.theme, isLoading]);

  return <>{children}</>;
}
