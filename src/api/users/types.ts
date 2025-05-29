import { UserProfile, UserPreferences } from '@/types';

// API Request Types
export interface UpdateProfileRequest {
  name?: string;
  organization?: string;
  role?: string;
}

export interface UpdatePreferencesRequest {
  defaultDocumentIds?: string[];
  favoriteDocumentIds?: string[];
  theme?: 'light' | 'dark' | 'system';
}

// API Response Types
export interface UserResponse {
  user: UserProfile;
}

export interface PreferencesResponse {
  preferences: UserPreferences;
}

export interface UpdateProfileResponse {
  user: UserProfile;
  message: string;
}

export interface UpdatePreferencesResponse {
  preferences: UserPreferences;
  message: string;
} 