import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedHospitals() {
  try {
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

    // Insert hospitals in batches
    const batchSize = 50;
    for (let i = 0; i < hospitals.length; i += batchSize) {
      const batch = hospitals.slice(i, i + batchSize);

      const { error } = await supabase
        .from('hospitals')
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
      }

      // console.warn(`Inserted batch ${i / batchSize + 1} (${batch.length} hospitals)`);
    }

    // console.warn('✅ Successfully seeded all hospitals!');
  } catch (error) {
    console.error('❌ Error seeding hospitals:', error);
    process.exit(1);
  }
}

seedHospitals();
