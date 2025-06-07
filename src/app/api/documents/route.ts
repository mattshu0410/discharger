import { createServerSupabaseClient } from '@/libs/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const ids = searchParams.get('ids');

    const supabase = createServerSupabaseClient();

    let dbQuery = supabase.from('documents').select('*');

    // If specific IDs are requested
    if (ids) {
      const documentIds = ids.split(',').filter(id => id.trim());
      dbQuery = dbQuery.in('id', documentIds);
    } else if (query) {
      // If there's a search query, filter by filename or summary
      dbQuery = dbQuery.or(`filename.ilike.%${query}%,summary.ilike.%${query}%`);
    }

    const { data, error } = await dbQuery
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
