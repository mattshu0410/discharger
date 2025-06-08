import type { CreateSnippetRequest, UpdateSnippetRequest } from './types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllSnippets,
  getSnippetById,
  searchSnippets,
} from './hooks'; // Updated import path and only import existing functions

// Query Keys
export const snippetKeys = {
  all: ['snippets'] as const,
  lists: () => [...snippetKeys.all, 'list'] as const,
  list: (filters: { search?: string }) => [...snippetKeys.lists(), filters] as const,
  details: () => [...snippetKeys.all, 'detail'] as const,
  detail: (id: string) => [...snippetKeys.details(), id] as const,
};

// Get all snippets for current user
export function useSnippets() {
  return useQuery({
    queryKey: snippetKeys.list({}),
    queryFn: () => getAllSnippets(),
  });
}

// Search snippets
export function useSearchSnippets(query: string, enabled = true) {
  return useQuery({
    queryKey: [...snippetKeys.all, 'search', query],
    queryFn: () => searchSnippets(query),
    enabled: enabled && query.length > 0,
  });
}

// Get single snippet by ID
export function useSnippet(id: string) {
  return useQuery({
    queryKey: snippetKeys.detail(id),
    queryFn: () => getSnippetById(id),
    enabled: !!id,
  });
}

// Create new snippet (TODO: implement when needed)
export function useCreateSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_data: CreateSnippetRequest) => {
      // TODO: Implement actual creation
      throw new Error('Create snippet not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snippetKeys.lists() });
    },
  });
}

// Update snippet (TODO: implement when needed)
export function useUpdateSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id: _id, data: _data }: { id: string; data: UpdateSnippetRequest }) => {
      // TODO: Implement actual update
      throw new Error('Update snippet not implemented yet');
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: snippetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: snippetKeys.lists() });
    },
  });
}

// Delete snippet (TODO: implement when needed)
export function useDeleteSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_id: string) => {
      // TODO: Implement actual deletion
      throw new Error('Delete snippet not implemented yet');
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: snippetKeys.lists() });
      queryClient.removeQueries({ queryKey: snippetKeys.detail(id) });
    },
  });
}
