/**
 * Utilities for loading and parsing CSV data files
 * Reads from public/assets/files/ directory
 */

import React from 'react';

export type MedicalTitle = {
  name: string;
};

export type ClinicalDepartment = {
  category: string;
  department: string;
};

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText: string, hasHeader: boolean = true): string[][] {
  const lines = csvText.trim().split('\n');
  const result: string[][] = [];

  for (let i = hasHeader ? 1 : 0; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (line) {
      // Simple CSV parsing - handles basic quotes but not complex escaping
      const values = line.split(',').map(val =>
        val.trim().replace(/^"(.*)"$/, '$1'),
      );
      result.push(values);
    }
  }

  return result;
}

/**
 * Load medical titles from CSV file
 */
export async function loadMedicalTitles(): Promise<MedicalTitle[]> {
  try {
    const response = await fetch('/assets/files/australian_medical_titles.csv');
    if (!response.ok) {
      throw new Error('Failed to load medical titles CSV');
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText, true); // Skip header row

    return rows
      .filter(row => row[0]) // Filter out rows with empty first column
      .map(row => ({
        name: row[0]!, // First column is "Full Name"
      }));
  } catch (error) {
    console.error('Error loading medical titles:', error);
    // Fallback to hard-coded list
    return [
      { name: 'Intern' },
      { name: 'Resident Medical Officer (RMO)' },
      { name: 'Senior Resident Medical Officer (SRMO)' },
      { name: 'Registrar' },
      { name: 'Advanced Trainee' },
      { name: 'Fellow' },
      { name: 'Consultant (Staff Specialist)' },
      { name: 'Visiting Medical Officer (VMO)' },
      { name: 'Career Medical Officer (CMO)' },
    ];
  }
}

/**
 * Load clinical departments from CSV file
 */
export async function loadClinicalDepartments(): Promise<ClinicalDepartment[]> {
  try {
    const response = await fetch('/assets/files/clinical_departments.csv');
    if (!response.ok) {
      throw new Error('Failed to load clinical departments CSV');
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText, true); // Skip header row

    return rows
      .filter(row => row[0] && row[1]) // Filter out rows with empty columns
      .map(row => ({
        category: row[0]!, // First column is "Category"
        department: row[1]!, // Second column is "Department"
      }));
  } catch (error) {
    console.error('Error loading clinical departments:', error);
    // Fallback to hard-coded list (abbreviated for brevity)
    return [
      { category: 'Medical', department: 'General Medicine / Internal Medicine' },
      { category: 'Medical', department: 'Cardiology' },
      { category: 'Medical', department: 'Endocrinology' },
      { category: 'Surgical', department: 'General Surgery' },
      { category: 'Critical Care', department: 'Emergency Medicine' },
      { category: 'Critical Care', department: 'Intensive Care (ICU)' },
      // ... more departments would be loaded from CSV
    ];
  }
}

/**
 * Hook for loading medical titles in React components
 */
export function useMedicalTitles() {
  const [titles, setTitles] = React.useState<MedicalTitle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadMedicalTitles()
      .then(setTitles)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { titles, loading, error };
}

/**
 * Hook for loading clinical departments in React components
 */
export function useClinicalDepartments() {
  const [departments, setDepartments] = React.useState<ClinicalDepartment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadClinicalDepartments()
      .then(setDepartments)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { departments, loading, error };
}
