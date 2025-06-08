import { randomUUID } from 'node:crypto';
import { createServerSupabaseClient } from '@/libs/supabase-server';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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
          discharge_text: '# Discharge Summary\n\n**Patient:** John Smith\n\n- **Diagnosis:** Hypertension, Chest Pain\n- **Summary:**\n  - Presented with chest pain radiating to the left arm.\n  - No previous cardiac events.\n  - Family history of coronary artery disease.\n  - Recent increase in work-related stress.\n  - Reports occasional shortness of breath and palpitations.\n  - Denies nausea or vomiting.\n\n**Plan:**\n- Outpatient follow-up\n- Continue antihypertensive medication\n- Stress management counseling',
        },
        {
          id: randomUUID(),
          user_id: userId,
          name: 'Jane Doe',
          age: 36,
          sex: 'female',
          context: 'Type 1 diabetic since age 12, presenting for routine follow-up. Reports good glycemic control with occasional hypoglycemic episodes. No history of retinopathy or nephropathy. Family history of autoimmune disorders. Works as a software engineer and exercises regularly.',
          discharge_text: '# Discharge Summary\n\n**Patient:** Jane Doe\n\n- **Diagnosis:** Type 1 Diabetes Mellitus\n- **Summary:**\n  - Good glycemic control, occasional hypoglycemia.\n  - No retinopathy or nephropathy.\n  - Family history of autoimmune disorders.\n  - Active lifestyle.\n\n**Plan:**\n- Continue current insulin regimen\n- Annual eye and kidney screening\n- Educate on hypoglycemia management',
        },
        {
          id: randomUUID(),
          user_id: userId,
          name: 'Alice Johnson',
          age: 29,
          sex: 'female',
          context: 'Recently diagnosed with asthma, presenting with increased shortness of breath and wheezing. No hospitalizations. Uses inhaler as needed. Lives in an urban area with high pollen count. No known drug allergies. Works as a teacher.',
          discharge_text: '# Discharge Summary\n\n**Patient:** Alice Johnson\n\n- **Diagnosis:** Asthma\n- **Summary:**\n  - Increased shortness of breath and wheezing.\n  - No hospitalizations.\n  - Uses inhaler as needed.\n  - Urban residence, high pollen count.\n  - No known drug allergies.\n\n**Plan:**\n- Continue inhaler as needed\n- Monitor symptoms\n- Allergen avoidance education',
        },
      ])
      .select();

    if (patientsError) {
      throw new Error(`Failed to create patients: ${patientsError.message}`);
    }

    // Insert document seed data for the current user
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .insert([
        {
          id: randomUUID(),
          user_id: userId,
          filename: 'Hypertension_Management_Guidelines_2024.pdf',
          summary: 'Comprehensive guidelines for diagnosis and management of hypertension in adults',
          source: 'community',
          share_status: 'public',
          uploaded_by: 'Dr. Smith',
          s3_url: 'https://s3.example.com/doc-1.pdf',
          tags: ['hypertension', 'cardiovascular', 'guidelines', 'blood pressure'],
          metadata: { pageCount: 45, specialty: 'Cardiology' },
        },
        {
          id: randomUUID(),
          user_id: userId,
          filename: 'Diabetes_Care_Standards_2024.pdf',
          summary: 'Standards of medical care in diabetes including glycemic targets and management algorithms',
          source: 'community',
          share_status: 'public',
          uploaded_by: 'Dr. Johnson',
          s3_url: 'https://s3.example.com/doc-2.pdf',
          tags: ['diabetes', 'endocrinology', 'glycemic control', 'insulin'],
          metadata: { pageCount: 78, specialty: 'Endocrinology' },
        },
      ])
      .select();

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
        documentsCreated: documents?.length || 0,
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
