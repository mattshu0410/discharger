import { createServerSupabaseClient } from '@/libs/supabase-server';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shortcut: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shortcut } = await params;
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .eq('user_id', user.id)
      .eq('shortcut', shortcut)
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
      { error: 'Internal Server Error', details: err },
      { status: 500 },
    );
  }
}
