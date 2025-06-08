import type { UpdatePreferencesRequest, UpdateProfileRequest } from './types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addDefaultDocument,
  addFavoriteDocument,
  getCurrentUser,
  removeDefaultDocument,
  removeFavoriteDocument,
  updateUserPreferences,
  updateUserProfile,
} from './hooks';

// Query Keys
export const userKeys = {
  all: ['user'] as const,
  current: () => [...userKeys.all, 'current'] as const,
  preferences: () => [...userKeys.all, 'preferences'] as const,
};

// Get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}

// Update user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
    },
  });
}

// Update user preferences
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferencesRequest) => updateUserPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
    },
  });
}

// Toggle favorite document
export function useToggleFavoriteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, isFavorite }: { documentId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        return removeFavoriteDocument(documentId);
      } else {
        return addFavoriteDocument(documentId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
    },
  });
}

// Toggle default document
export function useToggleDefaultDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, isDefault }: { documentId: string; isDefault: boolean }) => {
      if (isDefault) {
        return removeDefaultDocument(documentId);
      } else {
        return addDefaultDocument(documentId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
    },
  });
}

// Update theme
export function useUpdateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (theme: 'light' | 'dark' | 'system') =>
      updateUserPreferences({ theme }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() });

      // Apply theme to document
      if (data.preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (data.preferences.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
  });
}
