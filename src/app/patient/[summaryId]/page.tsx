'use client';

import type { Block, PatientProgress } from '@/types/blocks';
import { useState } from 'react';
import { FloatingChat, PatientLayout } from '@/components/PatientSimplified';

// Mock data for patient view - using static dates to avoid hydration issues
const mockPatientBlocks: Block[] = [
  {
    id: '1',
    type: 'medication',
    title: 'Your Medications',
    isEditable: false,
    isRequired: true,
    metadata: {
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
      version: '1.0',
    },
    data: {
      medications: [
        {
          id: 'med1',
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'Every 6 hours',
          duration: '3 days',
          status: 'new',
          instructions: 'Take with food to avoid stomach upset',
        },
        {
          id: 'med2',
          name: 'Amoxicillin',
          dosage: '250mg',
          frequency: 'Three times daily',
          duration: '7 days',
          status: 'new',
          instructions: 'Complete the full course even if you feel better',
        },
      ],
      groupBy: 'status',
    },
  },
  {
    id: '2',
    type: 'task',
    title: 'Your Recovery Tasks',
    isEditable: false,
    isRequired: true,
    metadata: {
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
      version: '1.0',
    },
    data: {
      tasks: [
        {
          id: 'task1',
          title: 'Schedule follow-up with GP',
          description: 'Book an appointment within 1-2 weeks to check your recovery progress',
          dueDate: new Date('2024-01-22T10:00:00Z'),
          priority: 'high',
          completed: true,
          completedAt: new Date('2024-01-14T15:00:00Z'),
        },
        {
          id: 'task2',
          title: 'Blood test at local clinic',
          description: 'Full blood count to check your recovery and ensure no complications',
          dueDate: new Date('2024-01-18T10:00:00Z'),
          priority: 'medium',
          completed: false,
        },
        {
          id: 'task3',
          title: 'Take rest for 2-3 days',
          description: 'Avoid strenuous activities and get plenty of sleep',
          priority: 'high',
          completed: false,
        },
      ],
      enableReminders: true,
      groupBy: 'priority',
    },
  },
  {
    id: '3',
    type: 'redFlag',
    title: 'When to Seek Immediate Help',
    isEditable: false,
    isRequired: true,
    metadata: {
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
      version: '1.0',
    },
    data: {
      symptoms: [
        {
          id: 'symptom1',
          symptom: 'Severe abdominal pain',
          description: 'Any sudden, severe pain in your abdomen that doesn\'t improve',
        },
        {
          id: 'symptom2',
          symptom: 'High fever',
          description: 'Temperature above 39°C (102°F) or persistent fever',
        },
        {
          id: 'symptom3',
          symptom: 'Persistent vomiting',
          description: 'Unable to keep fluids down for more than 12 hours',
        },
      ],
    },
  },
];

export default function PatientSummaryPage() {
  const [blocks, setBlocks] = useState<Block[]>(mockPatientBlocks);
  const [progress, setProgress] = useState<PatientProgress>({
    totalTasks: 3,
    completedTasks: 1,
    medicationsTaken: 1,
    totalMedications: 2,
    appointmentsScheduled: 1,
    totalAppointments: 1,
    overallCompletion: 45,
  });

  const handleBlockInteraction = (blockId: string, interactionType: string, data: any) => {
    console.warn('Patient interaction:', { blockId, interactionType, data });

    // Update progress based on interactions
    if (interactionType === 'task_completed') {
      const newCompleted = data.completed ? progress.completedTasks + 1 : progress.completedTasks - 1;
      setProgress(prev => ({
        ...prev,
        completedTasks: newCompleted,
        overallCompletion: Math.round((newCompleted / prev.totalTasks) * 40 + (prev.medicationsTaken / prev.totalMedications) * 30 + 30),
      }));
    }

    if (interactionType === 'medication_taken') {
      const newTaken = data.taken ? progress.medicationsTaken + 1 : progress.medicationsTaken - 1;
      setProgress(prev => ({
        ...prev,
        medicationsTaken: newTaken,
        overallCompletion: Math.round((prev.completedTasks / prev.totalTasks) * 40 + (newTaken / prev.totalMedications) * 30 + 30),
      }));
    }
  };

  const handleBlockUpdate = (blockId: string, updatedBlock: Block) => {
    setBlocks(prev => prev.map(block =>
      block.id === blockId ? updatedBlock : block,
    ));
  };

  return (
    <div className="relative h-screen">
      <PatientLayout
        blocks={blocks}
        progress={progress}
        onBlockUpdate={handleBlockUpdate}
        onBlockInteraction={handleBlockInteraction}
      />
      <FloatingChat isPreview={false} />
    </div>
  );
}
