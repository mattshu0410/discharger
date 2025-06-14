import type { UpdatePreferencesRequest, UpdateProfileRequest } from './types';
import type { UserProfile } from '@/types';

// Get current user profile
export async function getCurrentUser(): Promise<UserProfile> {
  const response = await fetch('/api/users/profile');

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
}

// Update user profile
export async function updateUserProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }

  return response.json();
}

// Update user preferences
export async function updateUserPreferences(data: UpdatePreferencesRequest): Promise<UserProfile> {
  const response = await fetch('/api/users/preferences', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update user preferences');
  }

  return response.json();
}

// These functions can be implemented later as needed
// For now, the profile page only needs getCurrentUser and updateUserPreferences
