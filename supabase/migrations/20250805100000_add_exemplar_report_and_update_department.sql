CREATE TYPE medical_department AS ENUM (
    'Emergency Medicine',
    'Internal Medicine',
    'Surgery',
    'Pediatrics',
    'Obstetrics and Gynecology',
    'Psychiatry',
    'Cardiology',
    'Dermatology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Radiology'
);

ALTER TABLE profiles
ADD COLUMN exemplar_report TEXT,
ADD COLUMN department medical_department;
