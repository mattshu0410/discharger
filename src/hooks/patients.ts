import type { Patient } from '@/types/patient';

// Get all patients, optionally limit the number returned
export async function getAllPatients(limit?: number): Promise<Patient[]> {
  const url = new URL('/api/patients', window.location.origin);
  if (limit) {
    url.searchParams.set('limit', limit.toString());
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to fetch patients');
  }

  return response.json();
}

// Get a single patient by ID
export async function getPatientById(id: number): Promise<Patient> {
  if (!id) {
    throw new Error('Patient ID is required');
  }

  const response = await fetch(`/api/patients/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Patient not found');
    }
    throw new Error('Failed to fetch patient');
  }

  return response.json();
}

// Create a new patient
export async function createPatient(data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
  const response = await fetch('/api/patients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create patient');
  }

  return response.json();
}
