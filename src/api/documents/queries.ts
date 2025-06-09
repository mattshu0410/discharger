import type { SearchDocumentsRequest, UpdateDocumentRequest } from './types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllDocuments,
  getDocumentById,
  getDocumentsByIds,
  searchDocuments,
} from './hooks'; // Updated import path

// Query Keys
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: Partial<SearchDocumentsRequest>) => [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  search: (query: string) => [...documentKeys.all, 'search', query] as const,
  signedUrl: (id: string) => [...documentKeys.all, 'signedUrl', id] as const,
};

// Get all documents
export function useDocuments(filters?: { source?: 'all' | 'user' | 'community'; tags?: string[] }) {
  return useQuery({
    queryKey: documentKeys.list(filters || {}),
    queryFn: () => getAllDocuments(),
  });
}

// Search documents
export function useSearchDocuments(query: string, enabled = true) {
  return useQuery({
    queryKey: documentKeys.search(query),
    queryFn: () => searchDocuments(query),
    enabled: enabled && query.length > 0,
  });
}

// Get single document
export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => getDocumentById(id),
    enabled: !!id,
  });
}

// Get multiple documents by IDs
export function useDocumentsByIds(ids: string[]) {
  return useQuery({
    queryKey: [...documentKeys.all, 'byIds', ids],
    queryFn: () => getDocumentsByIds(ids),
    enabled: ids.length > 0,
  });
}

// Upload document
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { files: File[]; summary: string; tags: string[]; shareStatus: 'private' | 'public' }) => {
      const formData = new FormData();

      // Add files
      data.files.forEach((file) => {
        formData.append('files', file);
      });

      // Add metadata
      formData.append('summary', data.summary);
      formData.append('tags', JSON.stringify(data.tags));
      formData.append('shareStatus', data.shareStatus);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload documents');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

// Update document (mock for now)
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDocumentRequest }) => {
      // Mock update
      await new Promise(resolve => setTimeout(resolve, 1000));

      const existingDoc = await getDocumentById(id);
      if (!existingDoc) {
        throw new Error('Document not found');
      }

      return { ...existingDoc, ...data };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

// Delete document
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.removeQueries({ queryKey: documentKeys.detail(id) });
    },
  });
}

// Get signed URL for document
export function useSignedUrl(documentId: string, enabled = true) {
  return useQuery({
    queryKey: documentKeys.signedUrl(documentId),
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/signed-url`);
      if (!response.ok) {
        throw new Error('Failed to get signed URL');
      }
      const data = await response.json();
      return data.signedUrl;
    },
    enabled: enabled && !!documentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Toggle favorite (would update user preferences)
export function useToggleDocumentFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      // Mock toggle favorite
      await new Promise(resolve => setTimeout(resolve, 200));
      return { documentId, isFavorite: true };
    },
    onSuccess: () => {
      // Would invalidate user preferences
      queryClient.invalidateQueries({ queryKey: ['user', 'preferences'] });
    },
  });
}
