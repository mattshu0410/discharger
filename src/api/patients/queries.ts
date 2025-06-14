import type { CreatePatientRequest, UpdatePatientRequest } from './types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPatient,
  deletePatient,
  getAllPatients,
  getPatientById,
  updatePatient,
} from './hooks';

// Query Keys
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

// Get all patients for current user
export function usePatients() {
  return useQuery({
    queryKey: patientKeys.lists(),
    queryFn: () => getAllPatients(),
  });
}

// Get single patient by ID
export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => getPatientById(id),
    enabled: !!id,
  });
}

// Create new patient
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientRequest) => createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

// Update patient
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientRequest }) =>
      updatePatient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

// Delete patient
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.removeQueries({ queryKey: patientKeys.detail(id) });
    },
  });
}
