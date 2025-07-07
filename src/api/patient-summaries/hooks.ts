import type { ListPatientSummariesParams, SupportedLocale, UpdatePatientSummaryInput } from './types';
import type { Block } from '@/types/blocks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPatientSummary,
  deletePatientSummary,
  getPatientSummary,
  getPatientSummaryTranslation,
  listPatientSummaries,
  listPatientSummaryTranslations,
  translatePatientSummary,
  updatePatientSummary,
  updatePatientSummaryBlocks,
  updatePatientSummaryLocale,
} from './queries';

// Query keys
export const patientSummariesKeys = {
  all: ['patient-summaries'] as const,
  lists: () => [...patientSummariesKeys.all, 'list'] as const,
  list: (params: ListPatientSummariesParams) => [...patientSummariesKeys.lists(), params] as const,
  details: () => [...patientSummariesKeys.all, 'detail'] as const,
  detail: (id: string, accessKey?: string) =>
    accessKey
      ? [...patientSummariesKeys.details(), id, 'access-key', accessKey]
      : [...patientSummariesKeys.details(), id] as const,
  translations: () => [...patientSummariesKeys.all, 'translations'] as const,
  translationsList: (id: string, accessKey?: string) =>
    accessKey
      ? [...patientSummariesKeys.translations(), id, 'access-key', accessKey]
      : [...patientSummariesKeys.translations(), id] as const,
  translation: (id: string, locale: SupportedLocale, accessKey?: string) =>
    accessKey
      ? [...patientSummariesKeys.translations(), id, locale, 'access-key', accessKey]
      : [...patientSummariesKeys.translations(), id, locale] as const,
};

// List patient summaries
export const usePatientSummaries = (params: ListPatientSummariesParams = {}) => {
  return useQuery({
    queryKey: patientSummariesKeys.list(params),
    queryFn: () => listPatientSummaries(params),
  });
};

// Get single patient summary
export const usePatientSummary = (id: string, options?: { accessKey?: string }) => {
  return useQuery({
    queryKey: patientSummariesKeys.detail(id, options?.accessKey),
    queryFn: () => getPatientSummary(id, options),
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
    onSuccess: (_, { id, data }) => {
      // Invalidate all variants of this specific patient summary (with and without access keys)
      queryClient.invalidateQueries({
        predicate: (query) => {
          // Match any detail query for this specific patient ID, regardless of access key
          return query.queryKey.length >= 3
            && query.queryKey[0] === 'patient-summaries'
            && query.queryKey[1] === 'detail'
            && query.queryKey[2] === id;
        },
      });
      queryClient.invalidateQueries({ queryKey: patientSummariesKeys.lists() });

      // If blocks were updated, invalidate all translation queries for this specific patient
      if (data.blocks) {
        queryClient.invalidateQueries({
          predicate: (query) => {
            // Match any translation query for this specific patient summary ID
            return query.queryKey.length >= 3
              && query.queryKey[0] === 'patient-summaries'
              && query.queryKey[1] === 'translations'
              && query.queryKey[2] === id;
          },
        });
      }
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
      // Invalidate all variants of this specific patient summary
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.length >= 3
            && query.queryKey[0] === 'patient-summaries'
            && query.queryKey[1] === 'detail'
            && query.queryKey[2] === id;
        },
      });
      queryClient.invalidateQueries({ queryKey: patientSummariesKeys.lists() });

      // Blocks were updated, invalidate all translation queries for this patient
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.length >= 3
            && query.queryKey[0] === 'patient-summaries'
            && query.queryKey[1] === 'translations'
            && query.queryKey[2] === id;
        },
      });
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

// Get translation for patient summary
export const usePatientSummaryTranslation = (
  patientSummaryId: string,
  locale: SupportedLocale,
  options?: { enabled?: boolean; accessKey?: string },
) => {
  return useQuery({
    queryKey: patientSummariesKeys.translation(patientSummaryId, locale, options?.accessKey),
    queryFn: () => getPatientSummaryTranslation(patientSummaryId, locale, options?.accessKey),
    enabled: !!patientSummaryId && !!locale && (options?.enabled !== false),
  });
};

// List available translations for patient summary
export const usePatientSummaryTranslations = (patientSummaryId: string, options?: { accessKey?: string }) => {
  return useQuery({
    queryKey: patientSummariesKeys.translationsList(patientSummaryId, options?.accessKey),
    queryFn: () => listPatientSummaryTranslations(patientSummaryId, options?.accessKey),
    enabled: !!patientSummaryId,
  });
};

// Translate patient summary
export const useTranslatePatientSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: translatePatientSummary,
    onSuccess: (_data, variables) => {
      // Invalidate the specific translation query
      queryClient.invalidateQueries({
        queryKey: patientSummariesKeys.translation(variables.patient_summary_id, variables.target_locale),
      });
      // Invalidate the translations list
      queryClient.invalidateQueries({
        queryKey: patientSummariesKeys.translationsList(variables.patient_summary_id),
      });
    },
  });
};

// Update patient summary locale preference
export const useUpdatePatientSummaryLocale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, locale }: { id: string; locale: SupportedLocale }) =>
      updatePatientSummaryLocale(id, locale),
    onSuccess: (_, { id }) => {
      // Invalidate all variants of this specific patient summary
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.length >= 3
            && query.queryKey[0] === 'patient-summaries'
            && query.queryKey[1] === 'detail'
            && query.queryKey[2] === id;
        },
      });
      queryClient.invalidateQueries({ queryKey: patientSummariesKeys.lists() });
    },
  });
};
