import type { Patient } from '@/types';

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
export async function getPatientById(id: string): Promise<Patient> {
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
export async function createPatient(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
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

// Update an existing patient
export async function updatePatient(id: string, data: Partial<Omit<Patient, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Patient> {
  if (!id) {
    throw new Error('Patient ID is required');
  }

  const response = await fetch(`/api/patients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Patient not found');
    }
    throw new Error('Failed to update patient');
  }

  return response.json();
}
