'use client';

import type { Block, PatientProgress } from '@/types/blocks';
import { IPhone14Frame } from '@/components/DevicePreviewer/iPhone14Frame';
import { PatientLayout } from '@/components/PatientSimplified/PatientLayout';
import { cn } from '@/libs/utils';

type PatientPreviewProps = {
  className?: string;
};

export function PatientPreview({ className }: PatientPreviewProps) {
  const handleBlockUpdate = () => {
    // No-op for demo purposes
  };

  const handleBlockInteraction = () => {
    // No-op for demo purposes
  };

  // Demo data based on Mervyn BRADY's discharge summary
  const demoBlocks: Block[] = [
    {
      id: 'medication-block-1',
      type: 'medication',
      title: 'Your Current Medications',
      isEditable: false,
      isRequired: true,
      metadata: {
        createdAt: new Date('2025-03-24T10:30:00Z'),
        updatedAt: new Date('2025-03-24T10:30:00Z'),
        version: '1.0.0',
      },
      data: {
        medications: [
          {
            id: 'med-1',
            name: 'Felodipine (Felodil XR, 10mg, modified release tablet)',
            dosage: '1 tablet',
            frequency: 'ONCE daily in morning',
            duration: 'Ongoing',
            status: 'unchanged',
            instructions: 'Take in the morning to help lower your blood pressure. Do not crush or chew.',
          },
          {
            id: 'med-2',
            name: 'Pantoprazole (40mg, enteric coated tablet)',
            dosage: '1 tablet',
            frequency: 'ONCE daily as needed',
            duration: 'As required',
            status: 'unchanged',
            instructions: 'Take for indigestion or heartburn. Swallow whole - do not cut, crush or chew.',
          },
          {
            id: 'med-3',
            name: 'Paracetamol (Panadol Osteo, 665mg, modified release)',
            dosage: '2 tablets',
            frequency: 'THREE times daily',
            duration: 'Ongoing',
            status: 'unchanged',
            instructions: 'Take regularly for pain relief. Space doses evenly throughout the day.',
          },
          {
            id: 'med-4',
            name: 'Rosuvastatin (40mg, oral tablet)',
            dosage: '1 tablet',
            frequency: 'ONCE daily in morning',
            duration: 'Ongoing',
            status: 'unchanged',
            instructions: 'Take in the morning to help lower your cholesterol.',
          },
          {
            id: 'med-5',
            name: 'Macrogol 3350 with electrolytes (oral powder)',
            dosage: '2 sachets',
            frequency: 'ONCE daily as needed',
            duration: 'As required',
            status: 'unchanged',
            instructions: 'Mix with water and take for constipation when needed.',
          },
        ],
        groupBy: 'status',
      },
    },
    {
      id: 'task-block-1',
      type: 'task',
      title: 'Important Tasks',
      isEditable: true,
      isRequired: true,
      metadata: {
        createdAt: new Date('2025-03-24T10:30:00Z'),
        updatedAt: new Date('2025-03-24T10:30:00Z'),
        version: '1.0.0',
      },
      data: {
        tasks: [
          {
            id: 'task-1',
            title: 'Get blood tests before specialist appointment',
            description: 'Ask your GP to organise MRI pituitary scan and hormone blood tests 2 weeks before your April 24th appointment.',
            priority: 'high',
            completed: false,
            dueDate: new Date('2025-04-10T00:00:00Z'),
          },
          {
            id: 'task-2',
            title: 'Take medications exactly as prescribed',
            description: 'Continue all your current medications. Do not stop any without talking to your doctor first.',
            priority: 'high',
            completed: false,
          },
          {
            id: 'task-3',
            title: 'Watch for vision changes',
            description: 'Monitor your vision, especially double vision or difficulty seeing to the side. Report any changes.',
            priority: 'medium',
            completed: false,
          },
        ],
        enableReminders: true,
        groupBy: 'priority',
      },
    },
    {
      id: 'redflag-block-1',
      type: 'redFlag',
      title: 'When to Contact Your Doctor',
      isEditable: false,
      isRequired: true,
      metadata: {
        createdAt: new Date('2025-03-24T10:30:00Z'),
        updatedAt: new Date('2025-03-24T10:30:00Z'),
        version: '1.0.0',
      },
      data: {
        symptoms: [
          {
            id: 'symptom-1',
            symptom: 'Severe headache or worsening headache',
            description: 'Call 000 immediately if you develop severe headache, especially with nausea or vomiting.',
          },
          {
            id: 'symptom-2',
            symptom: 'New or worsening vision problems',
            description: 'Contact your doctor immediately if you notice new double vision, vision loss, or other eye problems.',
          },
          {
            id: 'symptom-3',
            symptom: 'Weakness or difficulty moving',
            description: 'Call 000 if you experience sudden weakness, difficulty walking, or coordination problems.',
          },
          {
            id: 'symptom-4',
            symptom: 'Confusion or changes in thinking',
            description: 'Contact your doctor if you notice confusion, memory problems, or personality changes.',
          },
        ],
      },
    },
    {
      id: 'appointment-block-1',
      type: 'appointment',
      title: 'Your Follow-up Appointments',
      isEditable: true,
      isRequired: true,
      metadata: {
        createdAt: new Date('2025-03-24T10:30:00Z'),
        updatedAt: new Date('2025-03-24T10:30:00Z'),
        version: '1.0.0',
      },
      data: {
        appointments: [
          {
            id: 'appt-1',
            clinicName: 'Dr. Haigh - Endocrine Clinic',
            description: 'Hormone specialist to check your pituitary gland recovery',
            status: 'clinic_will_call',
            date: new Date('2025-04-24T10:00:00Z'),
          },
          {
            id: 'appt-2',
            clinicName: 'GCUH Ophthalmology (Eye Clinic)',
            description: 'Eye specialist to check your vision and eye movement',
            status: 'clinic_will_call',
          },
          {
            id: 'appt-3',
            clinicName: 'Medical Oncology',
            description: 'Cancer specialist for your prostate cancer treatment plan',
            status: 'clinic_will_call',
          },
          {
            id: 'appt-4',
            clinicName: 'Urology Surgery',
            description: 'Surgery for prostate treatment and bladder check',
            status: 'clinic_will_call',
          },
        ],
      },
    },
  ];

  const demoProgress: PatientProgress = {
    completedTasks: 0,
    totalTasks: 3,
    medicationsTaken: 0,
    totalMedications: 5,
    appointmentsScheduled: 0,
    totalAppointments: 4,
    overallCompletion: 0,
  };

  return (
    <div className={cn('h-full w-full flex items-center justify-center text-left', className)}>
      {/* Wrapper to handle container conflicts and provide stable dimensions */}
      <div
        className="relative flex items-center justify-center"
        style={{
          height: '580px',
          width: '320px',
          containerType: 'normal', // Override container-type to avoid conflicts with comparison
          overflow: 'visible', // Ensure iPhone frame is visible
        }}
      >
        <IPhone14Frame
          variant="graphite"
          className="absolute"
        >
          <PatientLayout
            blocks={demoBlocks}
            progress={demoProgress}
            onBlockUpdate={handleBlockUpdate}
            onBlockInteraction={handleBlockInteraction}
            isPreview={true}
            patientName="Mervyn BRADY"
            dischargeDate="March 24, 2025"
          />
        </IPhone14Frame>
      </div>
    </div>
  );
}
