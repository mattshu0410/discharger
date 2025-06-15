import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/libs/supabase-server';

// Endpoint to seed data for users (auto-seeding or manual in development)
export async function POST(req: Request) {
  // Check if this is called from webhook (auto-seeding) or in development
  const userIdHeader = req.headers.get('X-User-ID');
  const isWebhookCall = !!userIdHeader;

  if (!isWebhookCall && process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Manual seeding only available in development' }, { status: 403 });
  }

  try {
    let userId: string;

    if (userIdHeader) {
      // Called from webhook - use provided user ID
      userId = userIdHeader;
    } else {
      // Called from frontend - use current user
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: 'Must be logged in' }, { status: 401 });
      }
      userId = user.id;
    }

    const supabase = createServerSupabaseClient();

    // console.warn(`🌱 Seeding data for Clerk user: ${userId}`);

    // Clear existing development data for this user
    await supabase.from('patients').delete().eq('user_id', userId);
    await supabase.from('snippets').delete().eq('user_id', userId);

    // Get existing documents to clean up storage files
    const { data: existingDocs } = await supabase
      .from('documents')
      .select('s3_url')
      .eq('user_id', userId);

    // Delete existing files from storage
    if (existingDocs && existingDocs.length > 0) {
      const filePaths = existingDocs
        .filter(doc => doc.s3_url && doc.s3_url.includes('/documents/'))
        .map(doc => doc.s3_url.split('/documents/')[1]);

      if (filePaths.length > 0) {
        await supabase.storage.from('documents').remove(filePaths);
      }
    }

    await supabase.from('documents').delete().eq('user_id', userId);

    // Insert patient seed data for the current user
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .insert([
        {
          id: randomUUID(),
          user_id: userId,
          name: 'Sarah Johnson',
          age: 28,
          sex: 'female',
          context: `ADMISSION NOTE
Chief Complaint: Severe headache, visual disturbance, and elevated blood pressure at 36 weeks gestation

History of Present Illness: 28-year-old G1P0 female at 36+2 weeks gestation presents with sudden onset severe frontal headache, photophobia, and "seeing spots" for the past 6 hours. Patient reports no previous episodes. Blood pressure on arrival 165/105 mmHg. Denies chest pain, shortness of breath, or epigastric pain. Fetal movements normal per patient.

Past Medical History: Unremarkable. No previous hypertension, diabetes, or kidney disease.

Obstetric History: G1P0, spontaneous conception, uncomplicated pregnancy until 32 weeks when mild elevation in blood pressure noted at routine visit (142/88). Started on methyldopa 250mg BD with improved control until today.

Medications: Methyldopa 250mg BD, pregnancy multivitamins, iron supplements

Allergies: NKDA

Physical Examination:
- Vital Signs: BP 165/105, HR 88, RR 18, Temp 36.8°C, O2 Sat 98% RA
- General: Alert, appears uncomfortable due to headache
- Neurological: Hyperreflexia 3+, no clonus, mild photophobia
- Cardiovascular: RRR, no murmurs
- Respiratory: Clear to auscultation bilaterally
- Abdomen: Gravid uterus appropriate for dates, fundal height 35cm
- Extremities: 2+ pitting edema bilateral lower limbs

Investigations:
- Urine dipstick: Protein 3+
- FBC: Hb 105 g/L, Platelets 95,000, WCC 12.5
- UEC: Creatinine 125 umol/L (baseline 65), Urea 8.2
- LFTs: ALT 85 U/L, AST 92 U/L
- 24-hour urine protein: 4.2g (severe proteinuria)
- CTG: Reactive, no decelerations

Assessment: Severe preeclampsia at 36+2 weeks gestation

Plan:
- Immediate delivery indicated
- Magnesium sulfate for seizure prophylaxis
- Antihypertensive therapy (labetalol)
- Corticosteroids not required at this gestation
- Continuous fetal monitoring
- Lower segment caesarean section planned`,
          discharge_text: JSON.stringify({
            id: 'discharge_seed_001',
            patientId: null,
            sections: [
              {
                id: 'section_1',
                title: 'Administrative Information',
                content: `Royal Hospital for Women\nLocal Health District: South Eastern Sydney\nAddress: Barker Street, Randwick NSW 2031\nPhone: (02) 9382 6111\nFax: (02) 9382 6333\n\nAdmission Date: [DATE]\nTo be Discharged: [DATE]\nPhysician Name: Dr. Sarah Chen\nTitle: Staff Specialist\nDepartment: Maternal Fetal Medicine\n\nPatient Full Name: Sarah Johnson\nDate of Birth: [DOB] (Age 28 years)\nSex: Female\nMRN: [MRN]`,
                order: 1,
                citations: [],
              },
              {
                id: 'section_2',
                title: 'Introduction + Summary of Care',
                content: `Dear Dr. X, thank you for reviewing Sarah Johnson a 28 year old female to be discharged on [discharge date] from Maternal Fetal Medicine at Royal Hospital for Women. The summary of their presentation and condition is documented below.

* <CIT id="c1">Principal diagnosis: Severe preeclampsia at 36+2 weeks gestation</CIT>
* <CIT id="c2">Reason for presentation: Sudden onset severe frontal headache, photophobia, and visual disturbance with blood pressure 165/105 mmHg</CIT>
* <CIT id="c3">Secondary diagnoses: Intrauterine growth restriction, thrombocytopenia secondary to preeclampsia</CIT>
* <CIT id="c4">Past medical history: Primigravida with uncomplicated pregnancy until 32 weeks when mild hypertension developed</CIT>
* <CIT id="d1">Emergency lower segment caesarean section performed under spinal anaesthesia</CIT>
* <CIT id="d2">Magnesium sulfate administered for seizure prophylaxis as per SOMANZ guidelines</CIT>
* <CIT id="c5">Baby delivered at 36+2 weeks, birth weight 2.1kg, Apgar scores 8 and 9</CIT>
* <CIT id="c6">Post-operative recovery complicated by persistent hypertension requiring multiple antihypertensive agents</CIT>`,
                order: 2,
                citations: [
                  {
                    id: 'c1',
                    context: 'Assessment: Severe preeclampsia at 36+2 weeks gestation',
                    relevanceScore: 1.0,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c2',
                    context: '28-year-old G1P0 female at 36+2 weeks gestation presents with sudden onset severe frontal headache, photophobia, and "seeing spots" for the past 6 hours... Blood pressure on arrival 165/105 mmHg',
                    relevanceScore: 1.0,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c3',
                    context: 'FBC: Hb 105 g/L, Platelets 95,000, WCC 12.5... CTG: Reactive, no decelerations',
                    relevanceScore: 0.9,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c4',
                    context: 'Obstetric History: G1P0, spontaneous conception, uncomplicated pregnancy until 32 weeks when mild elevation in blood pressure noted',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd1',
                    context: 'Emergency delivery is recommended for severe preeclampsia with maternal symptoms and laboratory abnormalities',
                    relevanceScore: 0.95,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-1',
                    pageNumber: 12,
                  },
                  {
                    id: 'd2',
                    context: 'Magnesium sulfate should be administered for seizure prophylaxis in severe preeclampsia according to SOMANZ recommendations',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-2',
                    pageNumber: 8,
                  },
                  {
                    id: 'c5',
                    context: 'fundal height 35cm... CTG: Reactive, no decelerations',
                    relevanceScore: 0.7,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c6',
                    context: 'Post-operative monitoring showed persistent hypertension requiring escalation of antihypertensive therapy',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                ],
              },
              {
                id: 'section_3',
                title: 'Discharge Plan',
                content: `* <CIT id="d3">Maternal Fetal Medicine follow-up in 1-2 weeks, referral sent, patient will be contacted regarding this appointment</CIT>
* <CIT id="c7">Blood pressure monitoring twice daily for 2 weeks with GP review</CIT>
* <CIT id="d4">Full blood count and liver function tests to be repeated in 48-72 hours</CIT>
* <CIT id="c8">Contraception counselling provided, long-acting reversible contraception recommended</CIT>
* <CIT id="d5">Pregnancy planning counselling for future pregnancies given preeclampsia history</CIT>`,
                order: 3,
                citations: [
                  {
                    id: 'd3',
                    context: 'Close follow-up is essential for women with preeclampsia, with specialist review recommended within 2 weeks',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-1',
                    pageNumber: 25,
                  },
                  {
                    id: 'c7',
                    context: 'Plan: Continuous fetal monitoring, antihypertensive therapy (labetalol)',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd4',
                    context: 'Laboratory monitoring including platelet count and liver enzymes should continue postpartum',
                    relevanceScore: 0.85,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-2',
                    pageNumber: 18,
                  },
                  {
                    id: 'c8',
                    context: 'Post-partum counselling discussion completed regarding family planning',
                    relevanceScore: 0.7,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd5',
                    context: 'Women with previous preeclampsia have increased risk in subsequent pregnancies and require preconceptual counselling',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-3',
                    pageNumber: 31,
                  },
                ],
              },
              {
                id: 'section_4',
                title: 'Medications',
                content: `New medications:
* Labetalol 200mg twice daily orally
* Nifedipine modified release 30mg once daily orally

Ceased medications:
* Methyldopa 250mg twice daily CEASED

Unchanged medications:
* Patient is not on regular medication apart from antihypertensives`,
                order: 4,
                citations: [],
              },
              {
                id: 'section_5',
                title: 'Allergies/Adverse Reactions',
                content: 'No known drug allergies documented.',
                order: 5,
                citations: [],
              },
              {
                id: 'section_6',
                title: 'Information Provided to the Patient',
                content: `* <CIT id="d6">Education provided regarding signs and symptoms of preeclampsia recurrence in future pregnancies</CIT>
* <CIT id="c9">Blood pressure monitoring technique demonstrated and patient competent</CIT>
* Importance of medication compliance emphasized
* <CIT id="d7">Contraceptive options discussed, long-acting reversible contraception benefits explained</CIT>
* When to seek urgent medical attention: severe headache, visual disturbance, epigastric pain
* Understanding of discharge instructions confirmed, patient demonstrates good health literacy`,
                order: 6,
                citations: [
                  {
                    id: 'd6',
                    context: 'Patient education should include recognition of preeclampsia symptoms and importance of early pregnancy monitoring',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-1',
                    pageNumber: 45,
                  },
                  {
                    id: 'c9',
                    context: 'Patient education provided regarding home blood pressure monitoring',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd7',
                    context: 'Contraceptive counselling is important for women with previous pregnancy complications',
                    relevanceScore: 0.8,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-2',
                    pageNumber: 52,
                  },
                ],
              },
            ],
            metadata: {
              generatedAt: new Date(),
              llmModel: 'seed-data',
              documentIds: ['doc-uuid-placeholder-1', 'doc-uuid-placeholder-2', 'doc-uuid-placeholder-3'],
              feedbackApplied: [],
            },
          }),
        },
        {
          id: randomUUID(),
          user_id: userId,
          name: 'Robert Chen',
          age: 67,
          sex: 'male',
          context: `ADMISSION NOTE
Chief Complaint: Acute onset chest pain with shortness of breath

History of Present Illness: 67-year-old male presents with sudden onset central crushing chest pain radiating to left arm and jaw, associated with diaphoresis and nausea. Pain started 2 hours ago while watching television. No relief with rest. Associated shortness of breath. Denies syncope or palpitations.

Past Medical History:
- Hypertension (20 years) - well controlled on ramipril
- Hyperlipidemia - on atorvastatin
- Type 2 diabetes mellitus (10 years) - on metformin
- Ex-smoker (quit 15 years ago, 30 pack-year history)
- Family history of ischemic heart disease (father died of MI age 65)

Medications: Ramipril 10mg daily, atorvastatin 40mg nocte, metformin 1g BD

Allergies: NKDA

Physical Examination:
- Vital Signs: BP 145/95, HR 95, RR 22, Temp 36.5°C, O2 Sat 94% RA
- General: Diaphoretic, appears in distress
- Cardiovascular: Tachycardic, regular rhythm, no murmurs, normal heart sounds
- Respiratory: Fine crackles bilateral bases
- Abdomen: Soft, non-tender
- Extremities: No peripheral edema

Investigations:
- ECG: ST elevation 2-3mm leads II, III, aVF; reciprocal changes V1-V2
- Troponin I: 15.2 ng/mL (normal <0.04)
- CK-MB: 89 U/L (normal <25)
- Chest X-ray: Mild pulmonary edema
- FBC: Hb 140 g/L, WCC 11.2, Platelets 280
- UEC: Creatinine 95 umol/L, eGFR 68
- Lipids: Total cholesterol 5.8, LDL 3.2, HDL 0.9
- HbA1c: 7.2%

Assessment: Acute inferior STEMI with mild heart failure

Management:
- Primary PCI within 90 minutes
- Dual antiplatelet therapy (aspirin + clopidogrel)
- Statin therapy
- ACE inhibitor
- Beta-blocker when hemodynamically stable
- Successful PCI to RCA with drug-eluting stent
- Post-procedure angiogram shows TIMI 3 flow
- Echocardiogram: EF 45%, inferior wall hypokinesis`,
          discharge_text: JSON.stringify({
            id: 'discharge_seed_002',
            patientId: null,
            sections: [
              {
                id: 'section_1',
                title: 'Administrative Information',
                content: `Prince of Wales Hospital\nLocal Health District: South Eastern Sydney\nAddress: High Street, Randwick NSW 2031\nPhone: (02) 9382 2222\nFax: (02) 9382 2633\n\nAdmission Date: [DATE]\nTo be Discharged: [DATE]\nPhysician Name: Dr. Michael Thompson\nTitle: Consultant Cardiologist\nDepartment: Cardiology\n\nPatient Full Name: Robert Chen\nDate of Birth: [DOB] (Age 67 years)\nSex: Male\nMRN: [MRN]`,
                order: 1,
                citations: [],
              },
              {
                id: 'section_2',
                title: 'Introduction + Summary of Care',
                content: `Dear Dr. X, thank you for reviewing Robert Chen a 67 year old male to be discharged on [discharge date] from Cardiology at Prince of Wales Hospital. The summary of their presentation and condition is documented below.

* <CIT id="c1">Principal diagnosis: Acute inferior ST-elevation myocardial infarction</CIT>
* <CIT id="c2">Reason for presentation: Sudden onset central crushing chest pain with radiation to left arm, associated with diaphoresis and nausea</CIT>
* <CIT id="c3">Secondary diagnoses: Acute heart failure with reduced ejection fraction (45%), Type 2 diabetes mellitus, hypertension, hyperlipidemia</CIT>
* <CIT id="c4">Past medical history: Hypertension for 20 years, Type 2 diabetes for 10 years, ex-smoker with 30 pack-year history, family history of ischemic heart disease</CIT>
* <CIT id="d1">Primary percutaneous coronary intervention performed within 90 minutes of presentation</CIT>
* <CIT id="c5">Successful PCI to right coronary artery with drug-eluting stent deployment, achieving TIMI 3 flow</CIT>
* <CIT id="c6">Post-procedure echocardiogram demonstrated ejection fraction 45% with inferior wall hypokinesis</CIT>
* <CIT id="d2">Optimal medical therapy initiated including dual antiplatelet therapy, ACE inhibitor, and beta-blocker</CIT>
* <CIT id="c7">Clinical improvement with resolution of chest pain and stabilization of heart failure</CIT>`,
                order: 2,
                citations: [
                  {
                    id: 'c1',
                    context: 'ECG: ST elevation 2-3mm leads II, III, aVF; reciprocal changes V1-V2... Assessment: Acute inferior STEMI with mild heart failure',
                    relevanceScore: 1.0,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c2',
                    context: '67-year-old male presents with sudden onset central crushing chest pain radiating to left arm and jaw, associated with diaphoresis and nausea',
                    relevanceScore: 1.0,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c3',
                    context: 'Respiratory: Fine crackles bilateral bases... Chest X-ray: Mild pulmonary edema... Echocardiogram: EF 45%',
                    relevanceScore: 0.9,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c4',
                    context: 'Past Medical History: Hypertension (20 years), Type 2 diabetes mellitus (10 years), Ex-smoker (quit 15 years ago, 30 pack-year history), Family history of ischemic heart disease',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd1',
                    context: 'Primary PCI should be performed within 90 minutes for STEMI patients when feasible, as it is the gold standard reperfusion therapy',
                    relevanceScore: 0.95,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-4',
                    pageNumber: 15,
                  },
                  {
                    id: 'c5',
                    context: 'Primary PCI within 90 minutes... Successful PCI to RCA with drug-eluting stent... Post-procedure angiogram shows TIMI 3 flow',
                    relevanceScore: 0.9,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c6',
                    context: 'Echocardiogram: EF 45%, inferior wall hypokinesis',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd2',
                    context: 'Post-MI patients should receive optimal medical therapy including dual antiplatelet therapy, ACE inhibitor, beta-blocker, and statin therapy',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-5',
                    pageNumber: 22,
                  },
                  {
                    id: 'c7',
                    context: 'Patient clinically stable with resolution of chest pain and improvement in heart failure symptoms',
                    relevanceScore: 0.7,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                ],
              },
              {
                id: 'section_3',
                title: 'Discharge Plan',
                content: `* <CIT id="d3">Cardiology follow-up in 6 weeks, referral sent, patient will be contacted regarding this appointment</CIT>
* <CIT id="c8">General practitioner follow-up within 1 week for medication review and blood pressure monitoring</CIT>
* <CIT id="d4">Echocardiogram to be repeated in 3 months to assess left ventricular function recovery</CIT>
* <CIT id="c9">Lipid profile and HbA1c to be rechecked in 6-8 weeks</CIT>
* <CIT id="d5">Cardiac rehabilitation program referral - patient will be contacted to commence within 4-6 weeks</CIT>`,
                order: 3,
                citations: [
                  {
                    id: 'd3',
                    context: 'Regular cardiology follow-up is essential post-MI, with first appointment typically within 6-8 weeks',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-4',
                    pageNumber: 35,
                  },
                  {
                    id: 'c8',
                    context: 'Patient requires close monitoring of medications and cardiovascular risk factors',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd4',
                    context: 'Serial echocardiography is recommended post-MI to monitor left ventricular function recovery',
                    relevanceScore: 0.85,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-5',
                    pageNumber: 41,
                  },
                  {
                    id: 'c9',
                    context: 'HbA1c: 7.2%... Lipids: Total cholesterol 5.8, LDL 3.2',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd5',
                    context: 'Cardiac rehabilitation programs improve outcomes and should be offered to all eligible post-MI patients',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-6',
                    pageNumber: 18,
                  },
                ],
              },
              {
                id: 'section_4',
                title: 'Medications',
                content: `New medications:
* Aspirin 100mg once daily orally
* Clopidogrel 75mg once daily orally (continue for 12 months)
* Metoprolol 25mg twice daily orally
* Atorvastatin 80mg once daily orally (increased dose)

Changed medications:
* Ramipril increased to 10mg once daily orally

Unchanged medications:
* Metformin 1000mg twice daily orally`,
                order: 4,
                citations: [],
              },
              {
                id: 'section_5',
                title: 'Allergies/Adverse Reactions',
                content: 'No known drug allergies documented.',
                order: 5,
                citations: [],
              },
              {
                id: 'section_6',
                title: 'Information Provided to the Patient',
                content: `* <CIT id="d6">Education provided regarding cardiac medications, importance of compliance, and side effects to monitor</CIT>
* <CIT id="c10">Lifestyle modifications discussed: smoking cessation maintenance, dietary changes, and exercise guidelines</CIT>
* <CIT id="d7">Warning signs for cardiac events explained: chest pain, shortness of breath, and when to seek emergency care</CIT>
* <CIT id="c11">Diabetes management reinforced with emphasis on glycemic control post-MI</CIT>
* Understanding of discharge instructions confirmed, patient demonstrates good comprehension
* <CIT id="d8">Provided written information regarding cardiac rehabilitation and lifestyle modifications</CIT>`,
                order: 6,
                citations: [
                  {
                    id: 'd6',
                    context: 'Patient education regarding medication adherence is crucial for secondary prevention post-MI',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-5',
                    pageNumber: 55,
                  },
                  {
                    id: 'c10',
                    context: 'Ex-smoker (quit 15 years ago, 30 pack-year history)... lifestyle counselling provided',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd7',
                    context: 'Patients should be educated about warning signs of recurrent cardiac events and emergency presentation',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-4',
                    pageNumber: 48,
                  },
                  {
                    id: 'c11',
                    context: 'Type 2 diabetes mellitus (10 years)... HbA1c: 7.2%',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd8',
                    context: 'Structured patient education materials improve understanding and compliance with post-MI care',
                    relevanceScore: 0.8,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-6',
                    pageNumber: 33,
                  },
                ],
              },
            ],
            metadata: {
              generatedAt: new Date(),
              llmModel: 'seed-data',
              documentIds: ['doc-uuid-placeholder-4', 'doc-uuid-placeholder-5', 'doc-uuid-placeholder-6'],
              feedbackApplied: [],
            },
          }),
        },
        {
          id: randomUUID(),
          user_id: userId,
          name: 'Margaret Thompson',
          age: 75,
          sex: 'female',
          context: `ADMISSION NOTE
Chief Complaint: Confusion, falls, and decreased oral intake over 3 days

History of Present Illness: 75-year-old female brought by family due to progressive confusion, two falls in past 24 hours, and significantly decreased oral intake over 3 days. Family reports she has been increasingly withdrawn and "not herself". No fever documented at home. Some urinary incontinence noted, which is new for patient.

Past Medical History:
- Hypertension - on amlodipine
- Osteoarthritis - on paracetamol PRN
- Previous hip fracture (2018) - surgically repaired
- Mild cognitive impairment - baseline MMSE 24/30
- Lives independently with home care twice weekly

Medications: Amlodipine 5mg daily, paracetamol 500mg QID PRN

Allergies: Penicillin (rash)

Social History: Widowed, lives alone, independent with ADLs, non-smoker, rare alcohol

Physical Examination:
- Vital Signs: BP 95/60, HR 105, RR 18, Temp 38.1°C, O2 Sat 96% RA
- General: Appears confused, dehydrated
- MMSE: 18/30 (baseline 24/30)
- Cardiovascular: Tachycardic, regular rhythm, normal heart sounds
- Respiratory: Clear to auscultation bilaterally
- Abdomen: Soft, mild suprapubic tenderness
- Neurological: No focal neurological deficit, some confusion
- Skin: Poor skin turgor, dry mucous membranes

Investigations:
- Urine dipstick: Nitrites positive, leucocytes 3+, protein 1+
- Urine microscopy: >100 WCC/hpf, >20 RBC/hpf
- Blood cultures: Pending
- FBC: Hb 115 g/L, WCC 14.5 (neutrophils 85%), Platelets 380
- UEC: Creatinine 145 umol/L (baseline 90), Urea 15.8, eGFR 35
- CRP: 89 mg/L
- Chest X-ray: No acute changes

Assessment: Urinary tract infection with delirium and acute kidney injury secondary to dehydration

Management:
- IV fluid resuscitation
- Empirical antibiotics (trimethoprim-sulfamethoxazole)
- Delirium management - minimise medications, reorientation
- Falls risk assessment and prevention measures
- Social work referral for discharge planning`,
          discharge_text: JSON.stringify({
            id: 'discharge_seed_003',
            patientId: null,
            sections: [
              {
                id: 'section_1',
                title: 'Administrative Information',
                content: `St George Hospital\nLocal Health District: South Eastern Sydney\nAddress: Gray Street, Kogarah NSW 2217\nPhone: (02) 9113 1111\nFax: (02) 9113 1234\n\nAdmission Date: [DATE]\nTo be Discharged: [DATE]\nPhysician Name: Dr. Jennifer Walsh\nTitle: Consultant Geriatrician\nDepartment: Geriatric Medicine\n\nPatient Full Name: Margaret Thompson\nDate of Birth: [DOB] (Age 75 years)\nSex: Female\nMRN: [MRN]\nInterpreter required: No`,
                order: 1,
                citations: [],
              },
              {
                id: 'section_2',
                title: 'Introduction + Summary of Care',
                content: `Dear Dr. X, thank you for reviewing Margaret Thompson a 75 year old female to be discharged on [discharge date] from Geriatric Medicine at St George Hospital. The summary of their presentation and condition is documented below.

* <CIT id="c1">Principal diagnosis: Urinary tract infection with associated delirium</CIT>
* <CIT id="c2">Reason for presentation: Progressive confusion, falls, and decreased oral intake over 3 days with family concerns about functional decline</CIT>
* <CIT id="c3">Secondary diagnoses: Acute kidney injury secondary to dehydration, mild cognitive impairment (baseline), hypertension</CIT>
* <CIT id="c4">Past medical history: Mild cognitive impairment with baseline MMSE 24/30, previous hip fracture in 2018, hypertension, osteoarthritis</CIT>
* <CIT id="d1">Urine culture confirmed E. coli urinary tract infection sensitive to trimethoprim-sulfamethoxazole</CIT>
* <CIT id="c5">Initial assessment revealed dehydration with acute kidney injury (creatinine 145 from baseline 90)</CIT>
* <CIT id="c6">Delirium assessment using 4AT score confirmed acute confusional state</CIT>
* <CIT id="d2">Treatment included IV fluid resuscitation and appropriate antibiotic therapy</CIT>
* <CIT id="c7">Good clinical response with improvement in confusion and return to baseline cognitive function</CIT>
* <CIT id="c8">Physiotherapy assessment completed with safe mobility demonstrated prior to discharge</CIT>`,
                order: 2,
                citations: [
                  {
                    id: 'c1',
                    context: 'Urine dipstick: Nitrites positive, leucocytes 3+... Assessment: Urinary tract infection with delirium',
                    relevanceScore: 1.0,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c2',
                    context: '75-year-old female brought by family due to progressive confusion, two falls in past 24 hours, and significantly decreased oral intake over 3 days',
                    relevanceScore: 1.0,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c3',
                    context: 'UEC: Creatinine 145 umol/L (baseline 90)... acute kidney injury secondary to dehydration',
                    relevanceScore: 0.9,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c4',
                    context: 'Past Medical History: Hypertension, Osteoarthritis, Previous hip fracture (2018), Mild cognitive impairment - baseline MMSE 24/30',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd1',
                    context: 'E. coli is the most common causative organism for urinary tract infections in elderly women and is typically sensitive to trimethoprim-sulfamethoxazole',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-7',
                    pageNumber: 23,
                  },
                  {
                    id: 'c5',
                    context: 'UEC: Creatinine 145 umol/L (baseline 90), Urea 15.8... Skin: Poor skin turgor, dry mucous membranes',
                    relevanceScore: 0.9,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c6',
                    context: 'MMSE: 18/30 (baseline 24/30)... some confusion... delirium management',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd2',
                    context: 'Initial management of UTI-related delirium should include fluid resuscitation and appropriate antibiotic therapy based on local resistance patterns',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-8',
                    pageNumber: 15,
                  },
                  {
                    id: 'c7',
                    context: 'Patient showed good clinical response to treatment with resolution of confusion',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'c8',
                    context: 'Falls risk assessment and prevention measures... physiotherapy assessment completed',
                    relevanceScore: 0.7,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                ],
              },
              {
                id: 'section_3',
                title: 'Discharge Plan',
                content: `* <CIT id="c9">General practitioner follow-up within 1 week for medication review and cognitive assessment</CIT>
* <CIT id="d3">Urine culture follow-up if symptoms recur, education provided regarding UTI prevention</CIT>
* <CIT id="c10">Renal function to be rechecked in 1 week to ensure resolution of acute kidney injury</CIT>
* <CIT id="d4">Home care services increased to daily visits for 2 weeks to monitor medication compliance and functional status</CIT>
* <CIT id="c11">Family education provided regarding delirium prevention and early recognition of UTI symptoms</CIT>`,
                order: 3,
                citations: [
                  {
                    id: 'c9',
                    context: 'Patient requires close monitoring of cognitive function and medication management post-discharge',
                    relevanceScore: 0.9,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd3',
                    context: 'UTI prevention strategies include adequate fluid intake, complete bladder emptying, and prompt treatment of symptoms',
                    relevanceScore: 0.85,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-7',
                    pageNumber: 45,
                  },
                  {
                    id: 'c10',
                    context: 'UEC: Creatinine 145 umol/L (baseline 90)... acute kidney injury secondary to dehydration',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd4',
                    context: 'Increased home care support may be beneficial following delirium episodes to ensure medication compliance and monitor for recurrence',
                    relevanceScore: 0.8,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-8',
                    pageNumber: 52,
                  },
                  {
                    id: 'c11',
                    context: 'Family education and social work referral for discharge planning completed',
                    relevanceScore: 0.7,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                ],
              },
              {
                id: 'section_4',
                title: 'Medications',
                content: `New medications:
* Trimethoprim-sulfamethoxazole 160/800mg twice daily for 5 days (3 days remaining)

Unchanged medications:
* Amlodipine 5mg once daily orally
* Paracetamol 500mg four times daily as required for pain

Ceased medications:
* No medications ceased during admission`,
                order: 4,
                citations: [],
              },
              {
                id: 'section_5',
                title: 'Allergies/Adverse Reactions',
                content: 'Penicillin allergy - causes rash',
                order: 5,
                citations: [],
              },
              {
                id: 'section_6',
                title: 'Information Provided to the Patient',
                content: `* <CIT id="d5">Education provided regarding urinary tract infection prevention including adequate fluid intake and hygiene measures</CIT>
* <CIT id="c12">Medication compliance importance emphasized, with family involvement in monitoring</CIT>
* <CIT id="d6">Warning signs for UTI recurrence explained: burning urination, frequency, confusion, fever</CIT>
* <CIT id="c13">Falls prevention strategies reviewed with patient and family</CIT>
* Understanding of discharge instructions confirmed with patient and family present
* <CIT id="d7">Written information provided regarding delirium and cognitive changes in elderly patients</CIT>`,
                order: 6,
                citations: [
                  {
                    id: 'd5',
                    context: 'Patient education regarding UTI prevention is essential, particularly in elderly women with recurrent infections',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-7',
                    pageNumber: 62,
                  },
                  {
                    id: 'c12',
                    context: 'Family involved in discharge planning and medication management education',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd6',
                    context: 'Early recognition of UTI symptoms in elderly patients is crucial as presentation may be atypical',
                    relevanceScore: 0.9,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-8',
                    pageNumber: 31,
                  },
                  {
                    id: 'c13',
                    context: 'Falls risk assessment and prevention measures completed... two falls in past 24 hours',
                    relevanceScore: 0.8,
                    sourceType: 'user-context',
                    contextSection: 'main',
                  },
                  {
                    id: 'd7',
                    context: 'Family education regarding delirium is important for prevention and early recognition of future episodes',
                    relevanceScore: 0.8,
                    sourceType: 'selected-document',
                    documentId: 'doc-uuid-placeholder-8',
                    pageNumber: 67,
                  },
                ],
              },
            ],
            metadata: {
              generatedAt: new Date(),
              llmModel: 'seed-data',
              documentIds: ['doc-uuid-placeholder-7', 'doc-uuid-placeholder-8'],
              feedbackApplied: [],
            },
          }),
        },
      ])
      .select();

    if (patientsError) {
      throw new Error(`Failed to create patients: ${patientsError.message}`);
    }

    // Upload seed PDFs to storage and create document records
    const seedFiles = [
      {
        filename: 'HBP-Preeclampsia-During-Pregnancy.pdf',
        summary: 'Comprehensive guidelines for management of high blood pressure and preeclampsia during pregnancy',
        tags: ['pregnancy', 'hypertension', 'preeclampsia', 'maternal-health'],
      },
      {
        filename: 'SOMANZ-Hypertensive-Disorders-Pregnancy.pdf',
        summary: 'SOMANZ guidelines for hypertensive disorders in pregnancy including diagnosis and management protocols',
        tags: ['pregnancy', 'hypertension', 'SOMANZ', 'guidelines'],
      },
      {
        filename: 'Screening-Prevention-Preterm-PET.pdf',
        summary: 'Evidence-based guidelines for screening and prevention of preterm preeclampsia',
        tags: ['preeclampsia', 'screening', 'prevention', 'preterm'],
      },
    ];

    const documents = [];

    for (const seedFile of seedFiles) {
      try {
        // Read the PDF file from public/assets/files/
        const filePath = path.join(process.cwd(), 'public', 'assets', 'files', seedFile.filename);
        const fileBuffer = fs.readFileSync(filePath);

        // Generate unique storage path
        const documentId = randomUUID();
        const storagePath = `${userId}/${documentId}-${seedFile.filename}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, fileBuffer, {
            contentType: 'application/pdf',
            upsert: false,
          });

        if (uploadError) {
          console.error(`Failed to upload ${seedFile.filename}:`, uploadError);
          continue; // Skip this file and continue with others
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(storagePath);

        // Create document record
        documents.push({
          id: documentId,
          user_id: userId,
          filename: seedFile.filename,
          summary: seedFile.summary,
          source: 'community',
          share_status: 'public',
          uploaded_by: userId,
          s3_url: urlData.publicUrl,
          tags: seedFile.tags,
          metadata: {
            uploadedVia: 'dev-seed',
            originalPath: storagePath,
          },
        });
      } catch (error) {
        console.error(`Error processing ${seedFile.filename}:`, error);
        continue; // Skip this file and continue with others
      }
    }

    // Insert all successfully processed documents
    const { error: documentsError } = await supabase
      .from('documents')
      .insert(documents);

    if (documentsError) {
      throw new Error(`Failed to create documents: ${documentsError.message}`);
    }

    // Insert snippet seed data for the current user
    const { data: snippets, error: snippetsError } = await supabase
      .from('snippets')
      .insert([
        {
          user_id: userId,
          shortcut: 'orthonote',
          content: 'Orthopedic consultation note: Patient presents with chief complaint of [COMPLAINT]. Physical examination reveals [FINDINGS]. Assessment: [DIAGNOSIS]. Plan: [TREATMENT].',
        },
        {
          user_id: userId,
          shortcut: 'admitorders',
          content: `Admit to: [UNIT]
Diagnosis: [DIAGNOSIS]
Condition: [STABLE/GUARDED/CRITICAL]
Vitals: Per unit protocol
Activity: [BED REST/OOB/AMBULATE]
Diet: [NPO/CARDIAC/REGULAR]
IV: [TYPE] @ [RATE]
Labs: CBC, BMP, [ADDITIONAL]
Medications: [LIST]
Consults: [SERVICES]`,
        },
        {
          user_id: userId,
          shortcut: 'dischargenote',
          content: `DISCHARGE SUMMARY

Patient: [NAME]
MRN: [MRN]
Admission Date: [DATE]
Discharge Date: [DATE]

DISCHARGE DIAGNOSIS:
[PRIMARY DIAGNOSIS]

HOSPITAL COURSE:
[SUMMARY OF STAY]

DISCHARGE MEDICATIONS:
[MEDICATION LIST]

DISCHARGE INSTRUCTIONS:
[FOLLOW-UP INSTRUCTIONS]`,
        },
      ])
      .select();

    if (snippetsError) {
      throw new Error(`Failed to create snippets: ${snippetsError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Development data seeded successfully',
      data: {
        userId,
        patientsCreated: patients?.length || 0,
        documentsCreated: documents.length,
        snippetsCreated: snippets?.length || 0,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Development-only endpoint to clear user data
export async function DELETE(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }

  try {
    // Check if this is called from webhook with user ID header
    const userIdHeader = req.headers.get('X-User-ID');
    let userId: string;

    if (userIdHeader) {
      // Called from webhook - use provided user ID
      userId = userIdHeader;
    } else {
      // Called from frontend - use current user
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: 'Must be logged in' }, { status: 401 });
      }
      userId = user.id;
    }

    const supabase = createServerSupabaseClient();

    // console.warn(`🗑️ Clearing data for Clerk user: ${userId}`);

    // Get documents to clean up storage files first
    const { data: docsToDelete } = await supabase
      .from('documents')
      .select('s3_url')
      .eq('user_id', userId);

    // Delete files from storage
    if (docsToDelete && docsToDelete.length > 0) {
      const filePaths = docsToDelete
        .filter(doc => doc.s3_url && doc.s3_url.includes('/documents/'))
        .map(doc => doc.s3_url.split('/documents/')[1]);

      if (filePaths.length > 0) {
        await supabase.storage.from('documents').remove(filePaths);
      }
    }

    // Clear user data (cascading deletes will handle related records)
    await Promise.all([
      supabase.from('patients').delete().eq('user_id', userId),
      supabase.from('snippets').delete().eq('user_id', userId),
      supabase.from('documents').delete().eq('user_id', userId),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Development data cleared successfully',
    });
  } catch (error) {
    console.error('Clear error:', error);
    return NextResponse.json(
      {
        error: 'Failed to clear data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
