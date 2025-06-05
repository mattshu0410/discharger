import { createServerSupabaseClient } from '@/libs/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000000';
    
    const supabase = createServerSupabaseClient();
    
    let dbQuery = supabase
      .from('snippets')
      .select('*')
      .eq('user_id', userId);
    
    // If there's a search query, filter by shortcut or content
    if (query) {
      dbQuery = dbQuery.or(`shortcut.ilike.%${query}%,content.ilike.%${query}%`);
    }
    
    const { data, error } = await dbQuery;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('snippets')
      .insert({
        user_id: body.userId || '00000000-0000-0000-0000-000000000000',
        shortcut: body.shortcut,
        content: body.content
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 