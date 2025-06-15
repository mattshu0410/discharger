import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/libs/supabase-server';

// Development-only endpoint to seed data for the current logged-in user
export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }

  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Must be logged in' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    // Use Clerk user ID directly as the user identifier
    // This bypasses the need for user_profiles table during development
    const userId = user.id; // Use Clerk user ID directly

    console.warn(`🌱 Seeding data for Clerk user: ${userId}`);

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
          name: 'John Smith',
          age: 42,
          sex: 'male',
          context: 'History of hypertension, presenting with chest pain radiating to the left arm. No previous cardiac events. Family history of coronary artery disease. Recent increase in work-related stress. Reports occasional shortness of breath and palpitations. Denies nausea or vomiting.',
          discharge_text: JSON.stringify({
            id: 'discharge_seed_001',
            patientId: null,
            sections: [
              {
                id: 'section_1',
                title: 'Summary of Care',
                content: 'Patient presented with chest pain radiating to the left arm. No previous cardiac events documented. Family history positive for coronary artery disease.',
                order: 1,
                citations: [],
              },
              {
                id: 'section_2',
                title: 'Discharge Plan',
                content: 'Continue antihypertensive medication as prescribed. Schedule outpatient follow-up within 2 weeks. Initiate stress management counseling.',
                order: 2,
                citations: [],
              },
            ],
            metadata: {
              generatedAt: new Date(),
              llmModel: 'seed-data',
              documentIds: [],
              feedbackApplied: [],
            },
          }),
        },
        {
          id: randomUUID(),
          user_id: userId,
          name: 'Jane Doe',
          age: 36,
          sex: 'female',
          context: 'Type 1 diabetic since age 12, presenting for routine follow-up. Reports good glycemic control with occasional hypoglycemic episodes. No history of retinopathy or nephropathy. Family history of autoimmune disorders. Works as a software engineer and exercises regularly.',
          discharge_text: JSON.stringify({
            id: 'discharge_seed_002',
            patientId: null,
            sections: [
              {
                id: 'section_1',
                title: 'Summary of Care',
                content: 'Type 1 diabetic since age 12, presenting for routine follow-up. Reports good glycemic control with occasional hypoglycemic episodes. No history of retinopathy or nephropathy.',
                order: 1,
                citations: [],
              },
              {
                id: 'section_2',
                title: 'Discharge Plan',
                content: 'Continue current insulin regimen as prescribed. Schedule annual eye and kidney screening. Provide education on hypoglycemia management and recognition.',
                order: 2,
                citations: [],
              },
            ],
            metadata: {
              generatedAt: new Date(),
              llmModel: 'seed-data',
              documentIds: [],
              feedbackApplied: [],
            },
          }),
        },
        {
          id: randomUUID(),
          user_id: userId,
          name: 'Alice Johnson',
          age: 29,
          sex: 'female',
          context: 'Recently diagnosed with asthma, presenting with increased shortness of breath and wheezing. No hospitalizations. Uses inhaler as needed. Lives in an urban area with high pollen count. No known drug allergies. Works as a teacher.',
          discharge_text: JSON.stringify({
            id: 'discharge_seed_003',
            patientId: null,
            sections: [
              {
                id: 'section_1',
                title: 'Summary of Care',
                content: 'Recently diagnosed with asthma, presenting with increased shortness of breath and wheezing. No hospitalizations to date. Uses inhaler as needed for symptom control.',
                order: 1,
                citations: [],
              },
              {
                id: 'section_2',
                title: 'Discharge Plan',
                content: 'Continue inhaler as needed for symptom relief. Monitor symptoms closely and seek medical attention if worsening. Provide allergen avoidance education given urban residence with high pollen count.',
                order: 2,
                citations: [],
              },
            ],
            metadata: {
              generatedAt: new Date(),
              llmModel: 'seed-data',
              documentIds: [],
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
          uploaded_by: user.primaryEmailAddress?.emailAddress || userId,
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
        userEmail: user.primaryEmailAddress?.emailAddress,
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
export async function DELETE() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }

  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Must be logged in' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    // Use Clerk user ID directly
    const userId = user.id;

    console.warn(`🗑️ Clearing data for Clerk user: ${userId}`);

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
