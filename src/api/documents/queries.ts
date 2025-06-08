import type { Document } from '@/types';
import type { SearchDocumentsRequest, UpdateDocumentRequest } from './types';
import {
  getAllDocuments,
  getDocumentById,
  getDocumentsByIds,
  searchDocuments,
} from '@/hooks/documents';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: Partial<SearchDocumentsRequest>) => [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  search: (query: string) => [...documentKeys.all, 'search', query] as const,
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

// Upload document (mock for now)
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { file: File; summary: string; tags: string[]; shareStatus: 'private' | 'public' }) => {
      // Mock upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        userId: 'user-1',
        filename: data.file.name,
        summary: data.summary,
        source: 'user',
        shareStatus: data.shareStatus,
        uploadedBy: 'Current User',
        uploadedAt: new Date(),
        s3Url: `https://s3.example.com/doc-${Date.now()}.pdf`,
        tags: data.tags,
      };

      return newDoc;
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
