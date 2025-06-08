import type { CreateSnippetRequest, UpdateSnippetRequest } from './types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSnippet,
  deleteSnippet,
  getAllSnippets,
  getSnippetById,
  searchSnippets,
  updateSnippet,
} from './hooks';

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

// Create new snippet
export function useCreateSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSnippetRequest) => createSnippet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snippetKeys.lists() });
    },
  });
}

// Update snippet
export function useUpdateSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSnippetRequest }) =>
      updateSnippet(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: snippetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: snippetKeys.lists() });
    },
  });
}

// Delete snippet
export function useDeleteSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSnippet(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: snippetKeys.lists() });
      queryClient.removeQueries({ queryKey: snippetKeys.detail(id) });
    },
  });
}
