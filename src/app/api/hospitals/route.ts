import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export async function GET() {
  try {
    // Check if user is authenticated with Clerk (required for RLS)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

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
