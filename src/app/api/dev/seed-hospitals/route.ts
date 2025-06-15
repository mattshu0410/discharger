import type { NextRequest } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export async function POST(_request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
    }

    const supabase = createServerSupabaseClient();

    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'public/assets/files/formatted_hospital_data.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Parse CSV (skip header row)
    const lines = csvContent.trim().split('\n').slice(1);

    const hospitals = lines.map((line) => {
      // Parse CSV line with proper quote handling
      const fields = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current.trim()); // Add the last field

      const [name, address, phone, fax, lhd] = fields;

      return {
        name: name || '',
        address: address || '',
        phone: phone || null,
        fax: fax || null,
        local_health_district: lhd || '',
      };
    }).filter(hospital => hospital.name); // Filter out empty rows

    // console.warn(`Preparing to insert ${hospitals.length} hospitals...`);

    // Clear existing hospitals first
    const { error: deleteError } = await supabase
      .from('hospitals')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Error clearing hospitals:', deleteError);
    }

    // Insert hospitals in batches
    const batchSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < hospitals.length; i += batchSize) {
      const batch = hospitals.slice(i, i + batchSize);

      const { error } = await supabase
        .from('hospitals')
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        return NextResponse.json(
          { error: `Failed to insert batch ${i / batchSize + 1}`, details: error },
          { status: 500 },
        );
      }

      totalInserted += batch.length;
      // console.warn(`Inserted batch ${i / batchSize + 1} (${batch.length} hospitals)`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${totalInserted} hospitals`,
      totalInserted,
    });
  } catch (error) {
    console.error('Error seeding hospitals:', error);
    return NextResponse.json(
      { error: 'Failed to seed hospitals', details: error },
      { status: 500 },
    );
  }
}
