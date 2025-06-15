import type { UserPreferences, UserProfile } from '@/types';

// API Request Types
export type UpdateProfileRequest = {
  name?: string;
  organization?: string;
  role?: string;
  title?: string;
  department?: string;
  hospitalId?: string;
};

export type UpdatePreferencesRequest = {
  defaultDocumentIds?: string[];
  favoriteDocumentIds?: string[];
  theme?: 'light' | 'dark' | 'system';
};

// API Response Types
export type UserResponse = {
  user: UserProfile;
};

export type PreferencesResponse = {
  preferences: UserPreferences;
};

export type UpdateProfileResponse = {
  user: UserProfile;
  message: string;
};

export type UpdatePreferencesResponse = {
  preferences: UserPreferences;
  message: string;
};
