import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, context } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // First, fetch the patient to check if it should be deleted
    const { data: patient, error: fetchError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Failed to fetch patient for cleanup:', fetchError);
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check if patient should be deleted (empty name, context, and no discharge)
    const shouldDelete = !patient.name?.trim()
      && !patient.context?.trim()
      && !context?.trim()
      && !patient.discharge_text;

    if (shouldDelete) {
      const { error: deleteError } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Failed to delete empty patient:', deleteError);
        return NextResponse.json({ error: 'Failed to cleanup patient' }, { status: 500 });
      }

      console.warn('Successfully cleaned up empty patient:', patientId);
      return NextResponse.json({ deleted: true, patientId });
    }

    return NextResponse.json({ deleted: false, patientId });
  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
