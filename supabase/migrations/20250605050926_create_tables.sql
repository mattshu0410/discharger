-- Drop existing tables if they exist
DROP TABLE IF EXISTS patient_documents CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS snippets CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    sex TEXT NOT NULL,
    context TEXT,
    discharge_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create documents table
CREATE TABLE documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    filename TEXT NOT NULL,
    summary TEXT,
    source TEXT NOT NULL,
    share_status TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    s3_url TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create snippets table
CREATE TABLE snippets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    shortcut TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, shortcut)
);

-- Create patient_documents junction table
CREATE TABLE patient_documents (
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (patient_id, document_id)
);

-- Add Row Level Security (RLS) policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;

-- Simple development policies - allow all access
CREATE POLICY "Allow all access to patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all access to documents" ON documents FOR ALL USING (true);
CREATE POLICY "Allow all access to snippets" ON snippets FOR ALL USING (true);
CREATE POLICY "Allow all access to patient_documents" ON patient_documents FOR ALL USING (true);

-- Insert seed data
INSERT INTO patients (id, name, age, sex, context, discharge_text) VALUES
    (1, 'John', 42, 'M', 'History of hypertension, presenting with chest pain radiating to the left arm. No previous cardiac events. Family history of coronary artery disease. Recent increase in work-related stress. Reports occasional shortness of breath and palpitations. Denies nausea or vomiting.', '# Discharge Summary\n\n**Patient:** John\n\n- **Diagnosis:** Hypertension, Chest Pain\n- **Summary:**\n  - Presented with chest pain radiating to the left arm.\n  - No previous cardiac events.\n  - Family history of coronary artery disease.\n  - Recent increase in work-related stress.\n  - Reports occasional shortness of breath and palpitations.\n  - Denies nausea or vomiting.\n\n**Plan:**\n- Outpatient follow-up\n- Continue antihypertensive medication\n- Stress management counseling'),
    (2, 'Jane', 36, 'F', 'Type 1 diabetic since age 12, presenting for routine follow-up. Reports good glycemic control with occasional hypoglycemic episodes. No history of retinopathy or nephropathy. Family history of autoimmune disorders. Works as a software engineer and exercises regularly.', '# Discharge Summary\n\n**Patient:** Jane\n\n- **Diagnosis:** Type 1 Diabetes Mellitus\n- **Summary:**\n  - Good glycemic control, occasional hypoglycemia.\n  - No retinopathy or nephropathy.\n  - Family history of autoimmune disorders.\n  - Active lifestyle.\n\n**Plan:**\n- Continue current insulin regimen\n- Annual eye and kidney screening\n- Educate on hypoglycemia management'),
    (3, 'Alice', 29, 'F', 'Recently diagnosed with asthma, presenting with increased shortness of breath and wheezing. No hospitalizations. Uses inhaler as needed. Lives in an urban area with high pollen count. No known drug allergies. Works as a teacher.', '# Discharge Summary\n\n**Patient:** Alice\n\n- **Diagnosis:** Asthma\n- **Summary:**\n  - Increased shortness of breath and wheezing.\n  - No hospitalizations.\n  - Uses inhaler as needed.\n  - Urban residence, high pollen count.\n  - No known drug allergies.\n\n**Plan:**\n- Continue inhaler as needed\n- Monitor symptoms\n- Allergen avoidance education');

-- Insert seed documents with a simple UUID
INSERT INTO documents (id, user_id, filename, summary, source, share_status, uploaded_by, s3_url, tags, metadata)
SELECT 
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000'::uuid,  -- Simple UUID for development
    d.filename,
    d.summary,
    d.source,
    d.share_status,
    d.uploaded_by,
    d.s3_url,
    d.tags,
    d.metadata::jsonb
FROM (
    VALUES 
        ('Hypertension_Management_Guidelines_2024.pdf', 'Comprehensive guidelines for diagnosis and management of hypertension in adults', 'community', 'public', 'Dr. Smith', 'https://s3.example.com/doc-1.pdf', ARRAY['hypertension', 'cardiovascular', 'guidelines', 'blood pressure'], '{"pageCount": 45, "specialty": "Cardiology"}'),
        ('Diabetes_Care_Standards_2024.pdf', 'Standards of medical care in diabetes including glycemic targets and management algorithms', 'community', 'public', 'Dr. Johnson', 'https://s3.example.com/doc-2.pdf', ARRAY['diabetes', 'endocrinology', 'glycemic control', 'insulin'], '{"pageCount": 78, "specialty": "Endocrinology"}')
) AS d(filename, summary, source, share_status, uploaded_by, s3_url, tags, metadata);

-- Insert seed snippets
INSERT INTO snippets (id, user_id, shortcut, content)
VALUES 
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000'::uuid, 'orthonote', 'Orthopedic consultation note: Patient presents with chief complaint of [COMPLAINT]. Physical examination reveals [FINDINGS]. Assessment: [DIAGNOSIS]. Plan: [TREATMENT].'),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000'::uuid, 'admitorders', E'Admit to: [UNIT]\nDiagnosis: [DIAGNOSIS]\nCondition: [STABLE/GUARDED/CRITICAL]\nVitals: Per unit protocol\nActivity: [BED REST/OOB/AMBULATE]\nDiet: [NPO/CARDIAC/REGULAR]\nIV: [TYPE] @ [RATE]\nLabs: CBC, BMP, [ADDITIONAL]\nMedications: [LIST]\nConsults: [SERVICES]');
