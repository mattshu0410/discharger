import type { Patient } from '@/types/patient';

// Mock patient data
const mockPatients = [
  {
    id: 1,
    name: 'John',
    age: 42,
    sex: 'M',
    context: 'History of hypertension, presenting with chest pain radiating to the left arm. No previous cardiac events. Family history of coronary artery disease. Recent increase in work-related stress. Reports occasional shortness of breath and palpitations. Denies nausea or vomiting.',
    documentIds: [101, 102, 103],
    dischargeText: `# Discharge Summary\n\n**Patient:** John\n\n- **Diagnosis:** Hypertension, Chest Pain\n- **Summary:**\n  - Presented with chest pain radiating to the left arm.\n  - No previous cardiac events.\n  - Family history of coronary artery disease.\n  - Recent increase in work-related stress.\n  - Reports occasional shortness of breath and palpitations.\n  - Denies nausea or vomiting.\n\n**Plan:**\n- Outpatient follow-up\n- Continue antihypertensive medication\n- Stress management counseling`,
  },
  {
    id: 2,
    name: 'Jane',
    age: 36,
    sex: 'F',
    context: 'Type 1 diabetic since age 12, presenting for routine follow-up. Reports good glycemic control with occasional hypoglycemic episodes. No history of retinopathy or nephropathy. Family history of autoimmune disorders. Works as a software engineer and exercises regularly.',
    documentIds: [104, 105],
    dischargeText: `# Discharge Summary\n\n**Patient:** Jane\n\n- **Diagnosis:** Type 1 Diabetes Mellitus\n- **Summary:**\n  - Good glycemic control, occasional hypoglycemia.\n  - No retinopathy or nephropathy.\n  - Family history of autoimmune disorders.\n  - Active lifestyle.\n\n**Plan:**\n- Continue current insulin regimen\n- Annual eye and kidney screening\n- Educate on hypoglycemia management`,
  },
  {
    id: 3,
    name: 'Alice',
    age: 29,
    sex: 'F',
    context: 'Recently diagnosed with asthma, presenting with increased shortness of breath and wheezing. No hospitalizations. Uses inhaler as needed. Lives in an urban area with high pollen count. No known drug allergies. Works as a teacher.',
    documentIds: [106],
    dischargeText: `# Discharge Summary\n\n**Patient:** Alice\n\n- **Diagnosis:** Asthma\n- **Summary:**\n  - Increased shortness of breath and wheezing.\n  - No hospitalizations.\n  - Uses inhaler as needed.\n  - Urban residence, high pollen count.\n  - No known drug allergies.\n\n**Plan:**\n- Continue inhaler as needed\n- Monitor symptoms\n- Allergen avoidance education`,
  },
];

// Get all patients, optionally limit the number returned
export async function getAllPatients(limit?: number): Promise<Patient[]> {
  if (typeof limit === 'number') {
    return Promise.resolve(mockPatients.slice(0, limit));
  }
  return Promise.resolve(mockPatients);
}

// Get a single patient by ID
export async function getPatientById(id: number): Promise<Patient> {
  if (!id) {
    throw new Error('Patient ID is required');
  }
  const patient = mockPatients.find(patient => patient.id === id);
  if (!patient) {
    throw new Error('Patient not found');
  }
  return Promise.resolve(patient);
}
