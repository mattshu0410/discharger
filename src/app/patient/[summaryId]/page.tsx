'use client';

import type { Block, MedicationBlock, PatientProgress, TaskBlock } from '@/types/blocks';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePatientSummary } from '@/api/patient-summaries/hooks';
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
  const params = useParams();
  const searchParams = useSearchParams();
  const summaryId = params.summaryId as string;
  const accessKey = searchParams.get('access');
  console.warn('summaryId:', summaryId, 'accessKey:', accessKey);

  // Fetch patient summary using unified hook with access key
  const { data: summaryData, isLoading, error } = usePatientSummary(summaryId, {
    accessKey: accessKey || undefined,
  });

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

  // Type guards for block filtering
  const isTaskBlock = (block: Block): block is TaskBlock => block.type === 'task';
  const isMedicationBlock = (block: Block): block is MedicationBlock => block.type === 'medication';

  // Update blocks when real data is loaded
  useEffect(() => {
    if (summaryData) {
      setBlocks(summaryData.blocks || mockPatientBlocks);

      // Calculate progress from actual blocks
      const taskBlocks = summaryData.blocks?.filter(isTaskBlock) || [];
      const medicationBlocks = summaryData.blocks?.filter(isMedicationBlock) || [];

      const totalTasks = taskBlocks.reduce((total: number, block: TaskBlock) =>
        total + (block.data.tasks?.length || 0), 0);
      const completedTasks = taskBlocks.reduce((total: number, block: TaskBlock) =>
        total + (block.data.tasks?.filter(task => task.completed)?.length || 0), 0);

      const totalMedications = medicationBlocks.reduce((total: number, block: MedicationBlock) =>
        total + (block.data.medications?.length || 0), 0);

      setProgress({
        totalTasks,
        completedTasks,
        medicationsTaken: 0, // This would be tracked separately in a real implementation
        totalMedications,
        appointmentsScheduled: 0, // This would be calculated from appointment blocks
        totalAppointments: 0,
        overallCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      });
    }
  }, [summaryData]);

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your discharge summary...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            The link you used is invalid or has expired. Please contact your healthcare provider for a new link.
          </p>
          {!accessKey && (
            <p className="text-sm text-muted-foreground">
              No access key provided in the URL.
            </p>
          )}
        </div>
      </div>
    );
  }

  const patientName = summaryData?.patients?.name || 'Patient';
  const dischargeDate = summaryData?.created_at
    ? new Date(summaryData.created_at).toLocaleDateString()
    : '';

  return (
    <div className="relative h-screen">
      <PatientLayout
        blocks={blocks}
        progress={progress}
        onBlockUpdate={handleBlockUpdate}
        onBlockInteraction={handleBlockInteraction}
        patientName={patientName}
        dischargeDate={dischargeDate}
        patientSummaryId={summaryData?.id}
        patientAccessKey={accessKey || undefined}
      />
      <FloatingChat isPreview={false} />
    </div>
  );
}
