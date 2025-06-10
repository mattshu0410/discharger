import type { Patient } from '@/types';

// Request types for patient operations
export type CreatePatientRequest = Omit<Patient, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'dischargeSummary'>;

export type UpdatePatientRequest = Partial<Omit<Patient, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'dischargeSummary'>>;

// Response types
export type PatientsResponse = {
  data: Patient[];
  total: number;
};

export type PatientResponse = {
  data: Patient;
};
