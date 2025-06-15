import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data: hospitals, error } = await supabase
      .from('hospitals')
      .select('id, name, local_health_district')
      .order('name');

    if (error) {
      console.error('Error fetching hospitals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch hospitals' },
        { status: 500 },
      );
    }

    return NextResponse.json(hospitals || []);
  } catch (error) {
    console.error('Error in hospitals API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
