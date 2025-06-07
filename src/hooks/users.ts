import type { UpdatePreferencesRequest, UpdateProfileRequest } from '@/api/users/types';
import type { UserProfile } from '@/types';

// Use the same UUID as in the database migration
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

// Mock user data aligned with database
const mockUser: UserProfile = {
  id: DEFAULT_USER_ID,
  email: 'doctor@example.com',
  name: 'Dr. John Smith',
  organization: 'General Hospital',
  role: 'Attending Physician',
  preferences: {
    defaultDocumentIds: [], // Will be populated from actual documents in DB
    favoriteDocumentIds: [], // Will be populated from actual documents in DB
    theme: 'system',
  },
};

// Get current user profile
export async function getCurrentUser(): Promise<UserProfile> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

  // In a real app, you might fetch some user preferences from the database
  // For now, we'll return the mock user with the proper UUID
  return mockUser;
}

// Update user profile
export async function updateUserProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  if (data.name) {
    mockUser.name = data.name;
  }
  if (data.organization) {
    mockUser.organization = data.organization;
  }
  if (data.role) {
    mockUser.role = data.role;
  }

  return mockUser;
}

// Update user preferences
export async function updateUserPreferences(data: UpdatePreferencesRequest): Promise<UserProfile> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

  if (data.defaultDocumentIds) {
    mockUser.preferences.defaultDocumentIds = data.defaultDocumentIds;
  }
  if (data.favoriteDocumentIds) {
    mockUser.preferences.favoriteDocumentIds = data.favoriteDocumentIds;
  }
  if (data.theme) {
    mockUser.preferences.theme = data.theme;
  }

  return mockUser;
}

// Add favorite document
export async function addFavoriteDocument(documentId: string): Promise<UserProfile> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

  if (!mockUser.preferences.favoriteDocumentIds.includes(documentId)) {
    mockUser.preferences.favoriteDocumentIds.push(documentId);
  }

  return mockUser;
}

// Remove favorite document
export async function removeFavoriteDocument(documentId: string): Promise<UserProfile> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

  mockUser.preferences.favoriteDocumentIds = mockUser.preferences.favoriteDocumentIds.filter(
    id => id !== documentId,
  );

  return mockUser;
}

// Add default document
export async function addDefaultDocument(documentId: string): Promise<UserProfile> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

  if (!mockUser.preferences.defaultDocumentIds.includes(documentId)) {
    mockUser.preferences.defaultDocumentIds.push(documentId);
  }

  return mockUser;
}

// Remove default document
export async function removeDefaultDocument(documentId: string): Promise<UserProfile> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

  mockUser.preferences.defaultDocumentIds = mockUser.preferences.defaultDocumentIds.filter(
    id => id !== documentId,
  );

  return mockUser;
}

// Helper function to get the current user ID (used throughout the app)
export function getCurrentUserId(): string {
  return DEFAULT_USER_ID;
}
