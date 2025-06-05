import { createServerSupabaseClient } from '@/libs/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { shortcut: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000000';
    
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .eq('user_id', userId)
      .eq('shortcut', params.shortcut)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
      }
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