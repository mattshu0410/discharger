import type { UserProfile } from '@/types';
import { UpdateProfileRequest, UpdatePreferencesRequest } from '@/api/users/types';

// Mock user data
let mockUser: UserProfile = {
  id: 'user-1',
  email: 'doctor@example.com',
  name: 'Dr. John Smith',
  organization: 'General Hospital',
  role: 'Attending Physician',
  preferences: {
    defaultDocumentIds: ['doc-1', 'doc-2'],
    favoriteDocumentIds: ['doc-1', 'doc-4', 'doc-5'],
    theme: 'system',
  },
};

// Get current user profile
export async function getCurrentUser(): Promise<UserProfile> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  return mockUser;
}

// Update user profile
export async function updateUserProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  if (data.name) mockUser.name = data.name;
  if (data.organization) mockUser.organization = data.organization;
  if (data.role) mockUser.role = data.role;
  
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
    id => id !== documentId
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
    id => id !== documentId
  );
  
  return mockUser;
} 