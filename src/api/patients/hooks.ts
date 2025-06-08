import type { Patient } from '@/types';

// Mock data - in a real app, this would come from your database
const mockPatients: Patient[] = [
  {
    id: 'patient-1',
    userId: '00000000-0000-0000-0000-000000000000',
    name: 'John Smith',
    age: 65,
    sex: 'male',
    context: 'Admitted for chest pain evaluation. History of hypertension and diabetes.',
    documentIds: ['doc-1', 'doc-2'],
    snippetIds: ['snippet-1', 'snippet-2'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

// Get all patients for the current user
export async function getAllPatients(_userId?: string): Promise<Patient[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

  return mockPatients;
}

// Get a single patient by ID
export async function getPatientById(id: string): Promise<Patient | null> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

  return mockPatients.find(patient => patient.id === id) || null;
}

// Create a new patient
export async function createPatient(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

  const newPatient: Patient = {
    ...data,
    id: `patient-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockPatients.push(newPatient);
  return newPatient;
}

// Update an existing patient
export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

  const patientIndex = mockPatients.findIndex(patient => patient.id === id);
  if (patientIndex === -1) {
    throw new Error('Patient not found');
  }

  const existingPatient = mockPatients[patientIndex]!;
  mockPatients[patientIndex] = {
    ...existingPatient,
    ...data,
    id: existingPatient.id, // Ensure id is preserved
    updatedAt: new Date(),
  };

  return mockPatients[patientIndex]!;
}
