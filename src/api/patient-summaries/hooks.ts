import type { ListPatientSummariesParams, UpdatePatientSummaryInput } from './types';
import type { Block } from '@/types/blocks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPatientSummary,
  deletePatientSummary,
  getPatientSummary,
  listPatientSummaries,
  updatePatientSummary,
  updatePatientSummaryBlocks,
} from './queries';

// Query keys
export const patientSummariesKeys = {
  all: ['patient-summaries'] as const,
  lists: () => [...patientSummariesKeys.all, 'list'] as const,
  list: (params: ListPatientSummariesParams) => [...patientSummariesKeys.lists(), params] as const,
  details: () => [...patientSummariesKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientSummariesKeys.details(), id] as const,
};

// List patient summaries
export const usePatientSummaries = (params: ListPatientSummariesParams = {}) => {
  return useQuery({
    queryKey: patientSummariesKeys.list(params),
    queryFn: () => listPatientSummaries(params),
  });
};

// Get single patient summary
export const usePatientSummary = (id: string) => {
  return useQuery({
    queryKey: patientSummariesKeys.detail(id),
    queryFn: () => getPatientSummary(id),
    enabled: !!id,
  });
};

// Create patient summary
export const useCreatePatientSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPatientSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientSummariesKeys.lists() });
    },
  });
};

// Update patient summary
export const useUpdatePatientSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientSummaryInput }) =>
      updatePatientSummary(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: patientSummariesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: patientSummariesKeys.lists() });
    },
  });
};

// Update patient summary blocks
export const useUpdatePatientSummaryBlocks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, blocks }: { id: string; blocks: Block[] }) =>
      updatePatientSummaryBlocks(id, blocks),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: patientSummariesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: patientSummariesKeys.lists() });
    },
  });
};

// Delete patient summary
export const useDeletePatientSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePatientSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientSummariesKeys.all });
    },
  });
};
