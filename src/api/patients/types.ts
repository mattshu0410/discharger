import type { Patient } from '@/types';

// Request types for patient operations
export type CreatePatientRequest = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdatePatientRequest = Partial<Omit<Patient, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

// Response types
export type PatientsResponse = {
  data: Patient[];
  total: number;
};

export type PatientResponse = {
  data: Patient;
};
