import { createServerSupabaseClient } from '@/libs/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('id', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerSupabaseClient();
    
    // Validate required fields based on migration
    if (!body.name || !body.age || !body.sex) {
      return NextResponse.json(
        { error: 'Missing required fields: name, age, sex' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('patients')
      .insert({
        name: body.name,
        age: body.age,
        sex: body.sex,
        context: body.context || null,
        discharge_text: body.discharge_text || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 