import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllSnippets, 
  getSnippetById, 
  createSnippet, 
  updateSnippet, 
  deleteSnippet,
  searchSnippets
} from '@/hooks/snippets';
import { CreateSnippetRequest, UpdateSnippetRequest } from './types';

// Query Keys
export const snippetKeys = {
  all: ['snippets'] as const,
  lists: () => [...snippetKeys.all, 'list'] as const,
  list: (filters: { search?: string }) => [...snippetKeys.lists(), filters] as const,
  details: () => [...snippetKeys.all, 'detail'] as const,
  detail: (id: string) => [...snippetKeys.details(), id] as const,
};

// Get all snippets for current user
export function useSnippets(search?: string) {
  return useQuery({
    queryKey: snippetKeys.list({ search }),
    queryFn: () => search ? searchSnippets(search) : getAllSnippets(),
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