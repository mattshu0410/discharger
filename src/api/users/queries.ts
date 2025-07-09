import type { UpdatePreferencesRequest, UpdateProfileRequest } from './types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCurrentUser,
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
      const currentUser = await getCurrentUser();
      const favoriteIds = currentUser.preferences.favoriteDocumentIds || [];

      let updatedFavoriteIds;
      if (isFavorite) {
        // Remove from favorites
        updatedFavoriteIds = favoriteIds.filter(id => id !== documentId);
      } else {
        // Add to favorites
        updatedFavoriteIds = [...favoriteIds, documentId];
      }

      return updateUserPreferences({ favoriteDocumentIds: updatedFavoriteIds });
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
      const currentUser = await getCurrentUser();
      const defaultIds = currentUser.preferences.defaultDocumentIds || [];

      let updatedDefaultIds;
      if (isDefault) {
        // Remove from defaults
        updatedDefaultIds = defaultIds.filter(id => id !== documentId);
      } else {
        // Add to defaults
        updatedDefaultIds = [...defaultIds, documentId];
      }

      return updateUserPreferences({ defaultDocumentIds: updatedDefaultIds });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
      // Theme application is handled by ThemeProvider
    },
  });
}

// Update profile title
export function useUpdateTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => updateUserProfile({ title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
    },
  });
}

// Update profile department
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (department: string) => updateUserProfile({ department }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
    },
  });
}

// Update profile hospital
export function useUpdateHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hospitalId: string) => updateUserProfile({ hospitalId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
    },
  });
}

// Export aliases for backward compatibility
export const useUserProfile = useCurrentUser;
export const useUpdateUserPreferences = useUpdatePreferences;
