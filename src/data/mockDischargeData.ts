import type { DischargeSection, DischargeSummary } from '@/types/discharge';

export const DUMMY_ED_NOTE = `45 F presenting with chronic lower back pain
Progress
- Reports having bilateral lower back pain with radicular left leg pain for months
- Describes shooting pain to toes with occasional toe numbness
- Flares when standing
- No weakness, trauma, heavy lifting, bowel/bladder incontinence, fevers, weight loss
- Has trialled analgesia (unsure of name) without significant benefit
- Relief from topical creams
- Has seen GP and been referred to sports med centre, MRI pending end of April
- Used a mobility scooter during recent Singapore trip due to pain
PMHx
- Meningitis
- Hip OA
Medications
- Vitamins
- Magnesium
Allergies
- NKDA
SHx
- Home with wife
- iADLs
- Nil smoking
- Social EtOH
- Nil IVDU
O/E
- Appears well
- Mobilising independently
- No midline spinal or paraspinal tenderness
- Straight leg raise positive on left lower limb, negative on right
- No erythema/back swelling
- Lower limbs
  - normal tone bilaterally
  - power 5/5 in all domains
  - fine touch sensation intact, no asymmetry
  - reflexes present
  - babinski downgoing
  - pain flares with left ankle dorsiflexion
Impression
- Degenerative spinal changes with sciatica
Plan
- XR
- Analgesia
- Safety net
- LBP clinic`;

export const LOADING_MESSAGES = [
  'Enslaving medical students…',
  'Dodging cannulas…',
  'Bribing the coffee machine…',
  'Negotiating with the printer…',
  'Summoning medical knowledge…',
  'Caffeinating the algorithm…',
  'Teaching AI bedside manner…',
  'Translating doctor scribbles…',
];

export const mockDischargeSections: DischargeSection[] = [
  {
    id: 'summary-progress',
    title: 'Summary of Progress',
    content: `Dear Doctor,

Thank you for your ongoing care of Clarence, a 45-year-old female who presented to the Emergency Department at RNSH on 7/8/25 with chronic back pain and sciatica.

Clarence reported bilateral lower back pain for several months with left lower limb sciatica. They were able to mobilise independently, had no neurological deficits on examination, and had no red flags concerning for serious underlying pathology. They were advised to continue pharmacological and non-pharmacological measures to manage their pain, continue physical activity, follow up with our back pain clinic and have an MRI in late April as an outpatient as previously arranged.`,
    order: 1,
    citations: [
      {
        id: 'cite-1',
        context: 'bilateral lower back pain with radicular left leg pain for months',
        relevanceScore: 0.95,
        sourceType: 'user-context',
        contextSection: 'Progress notes',
      },
      {
        id: 'cite-2',
        context: 'MRI pending end of April',
        relevanceScore: 0.88,
        sourceType: 'user-context',
        contextSection: 'Plan',
      },
    ],
  },
  {
    id: 'discharge-plan',
    title: 'Discharge Plan',
    content: `1. Discharge home.

2. Please continue the following medications
- Celecoxib 100mg twice daily for 5 days
- Esomeprazole 20mg daily for 5 days  
- Panadol 1g four times a day as needed for pain

3. Follow-up with lower back pain clinic on Thursday as per the provided form (Phone: 9650 3542 to confirm appointment).

4. Please seek medical attention and/or present to your nearest emergency department if your symptoms get worse or you have any other concerns.
- Weakness in legs, unsteadiness when walking, changes to bowel or bladder function, severe pain at night, fevers`,
    order: 2,
    citations: [
      {
        id: 'cite-3',
        context: 'LBP clinic',
        relevanceScore: 0.92,
        sourceType: 'user-context',
        contextSection: 'Plan',
      },
      {
        id: 'cite-4',
        context: 'No weakness, trauma, heavy lifting, bowel/bladder incontinence, fevers, weight loss',
        relevanceScore: 0.85,
        sourceType: 'user-context',
        contextSection: 'Red flag symptoms',
      },
    ],
  },
];

export const mockDischargeSummary: DischargeSummary = {
  id: 'demo-summary',
  patientId: null,
  sections: mockDischargeSections,
  metadata: {
    generatedAt: new Date(),
    llmModel: 'gemini-2.0-flash-exp',
    documentIds: [],
    feedbackApplied: [],
  },
};
