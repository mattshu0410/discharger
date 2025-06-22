'use client';

import type { Block } from '@/types/blocks';
import { AlertTriangle, Calendar, CheckSquare, Eye, FileText, Pill, Plus, Send, Share } from 'lucide-react';
import { useState } from 'react';
import { AppointmentBlock } from '@/components/blocks/AppointmentBlock';
import { MedicationBlock } from '@/components/blocks/MedicationBlock';
import { RedFlagBlock } from '@/components/blocks/RedFlagBlock';
import { TaskBlock } from '@/components/blocks/TaskBlock';
import { DevicePreview } from '@/components/DevicePreviewer';
import { FloatingChat, PatientLayout } from '@/components/PatientSimplified';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useUIStore } from '@/stores/uiStore';

// Mock data for demonstration
const mockBlocks: Block[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'My Appointments',
    isEditable: true,
    isRequired: true,
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0',
    },
    data: {
      appointments: [
        {
          id: 'appt1',
          clinicName: 'Primary Care - Dr. Ravery',
          description: 'Contact GP surgery to book follow-up appointment',
          status: 'patient_to_book',
        },
        {
          id: 'appt2',
          clinicName: 'Pulmonology - Dr. Johnson',
          description: 'Referral has been sent. You will be called about this.',
          status: 'clinic_will_call',
        },
        {
          id: 'appt3',
          clinicName: 'Cardiology - Dr. Smith',
          description: 'Follow-up appointment scheduled',
          status: 'already_booked',
          date: new Date('2025-01-30T10:00:00'),
        },
      ],
    },
  },
  {
    id: '2',
    type: 'medication',
    title: 'My Medications',
    isEditable: true,
    isRequired: true,
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
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
          isOTC: true,
          instructions: 'Take with food',
          taken: false,
          nextDue: new Date(Date.now() + 2 * 60 * 60 * 1000),
        },
        {
          id: 'med2',
          name: 'Amoxicillin',
          dosage: '250mg',
          frequency: 'Three times daily',
          duration: '7 days',
          status: 'stopped',
          isOTC: false,
          instructions: 'Complete the full course',
          taken: false,
        },
      ],
      groupBy: 'status',
      showImages: false,
    },
  },
  {
    id: '3',
    type: 'task',
    title: 'Recovery Tasks',
    isEditable: true,
    isRequired: true,
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0',
    },
    data: {
      tasks: [
        {
          id: 'task1',
          title: 'Schedule follow-up with GP',
          description: 'Book an appointment within 1-2 weeks',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          priority: 'high',
          category: 'appointments',
          completed: false,
        },
        {
          id: 'task2',
          title: 'Blood test at local clinic',
          description: 'Full blood count to check recovery',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          category: 'tests',
          completed: false,
        },
      ],
      enableReminders: true,
      groupBy: 'priority',
    },
  },
  {
    id: '4',
    type: 'redFlag',
    title: 'When to Seek Help',
    isEditable: true,
    isRequired: true,
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0',
    },
    data: {
      symptoms: [
        {
          id: 'symptom1',
          symptom: 'Severe chest pain',
          description: 'Any sudden, severe chest pain or pressure',
        },
        {
          id: 'symptom2',
          symptom: 'High fever',
          description: 'Temperature above 39°C (102°F)',
        },
        {
          id: 'symptom3',
          symptom: 'Difficulty breathing',
          description: 'Shortness of breath or trouble breathing',
        },
      ],
    },
  },
];

const blockTypes = [
  { type: 'medication', icon: Pill, label: 'Medications', color: 'bg-blue-100 text-blue-700' },
  { type: 'task', icon: CheckSquare, label: 'Tasks', color: 'bg-green-100 text-green-700' },
  { type: 'redFlag', icon: AlertTriangle, label: 'Red Flags', color: 'bg-red-100 text-red-700' },
  { type: 'appointment', icon: Calendar, label: 'Appointments', color: 'bg-purple-100 text-purple-700' },
  { type: 'text', icon: FileText, label: 'Text', color: 'bg-gray-100 text-gray-700' },
];

export default function ComposerPage() {
  const [blocks, setBlocks] = useState<Block[]>(mockBlocks);
  const [progress] = useState({
    totalTasks: 2,
    completedTasks: 0,
    medicationsTaken: 0,
    totalMedications: 2,
    appointmentsScheduled: 0,
    totalAppointments: 0,
    overallCompletion: 0,
  });

  // Zustand state
  const {
    isComposerPreviewMode: previewMode,
    isComposerGenerating: isGenerating,
    composerDischargeText: dischargeText,
    setComposerPreviewMode: setPreviewMode,
    setComposerGenerating: setIsGenerating,
    setComposerDischargeText: setDischargeText,
  } = useUIStore();

  const handleBlockUpdate = (blockId: string, updatedBlock: Block) => {
    setBlocks(prev => prev.map(block =>
      block.id === blockId ? updatedBlock : block,
    ));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const handleBlockInteraction = (blockId: string, interactionType: string, data: any) => {
    console.warn('Preview interaction:', { blockId, interactionType, data });
  };

  const renderBlock = (block: Block) => {
    const mode = previewMode ? 'preview' : 'edit';

    switch (block.type) {
      case 'medication':
        return (
          <MedicationBlock
            key={block.id}
            block={block}
            mode={mode}
            onUpdate={updatedBlock => handleBlockUpdate(block.id, updatedBlock)}
          />
        );
      case 'task':
        return (
          <TaskBlock
            key={block.id}
            block={block}
            mode={mode}
            onUpdate={updatedBlock => handleBlockUpdate(block.id, updatedBlock)}
          />
        );
      case 'redFlag':
        return (
          <RedFlagBlock
            key={block.id}
            block={block}
            mode={mode}
            onUpdate={updatedBlock => handleBlockUpdate(block.id, updatedBlock)}
          />
        );
      case 'appointment':
        return (
          <AppointmentBlock
            key={block.id}
            block={block}
            mode={mode}
            onUpdate={updatedBlock => handleBlockUpdate(block.id, updatedBlock)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Block Library Sidebar */}
      <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
        <h2 className="font-semibold text-lg mb-4">Block Library</h2>

        <div className="space-y-2 mb-6">
          {blockTypes.map(blockType => (
            <Button
              key={blockType.type}
              variant="outline"
              className="w-full justify-start gap-2 h-auto p-3"
            >
              <blockType.icon className="w-4 h-4" />
              <span>{blockType.label}</span>
              <Plus className="w-3 h-3 ml-auto" />
            </Button>
          ))}
        </div>

        <Separator className="my-4" />

        <h3 className="font-medium text-sm mb-3 text-muted-foreground">Current Blocks</h3>
        <div className="space-y-2">
          {blocks.map(block => (
            <div key={block.id} className="p-2 rounded border bg-card">
              <span className="text-sm font-medium">{block.title}</span>
              <Badge variant="outline" className="ml-2 text-xs">
                {block.type}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-semibold">Discharge Simplified Composer</h1>
            <p className="text-sm text-muted-foreground">Patient: John Doe • Discharged Jan 15, 2024</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={previewMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-1" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </Button>
            <Button size="sm">
              <Share className="w-4 h-4 mr-1" />
              Share with Patient
            </Button>
          </div>
        </div>

        {/* Preview/Edit Area */}
        <div className="flex-1 overflow-hidden">
          {previewMode
            ? (
          // Device Preview Mode
                <div className="h-full flex items-center justify-center">
                  <DevicePreview
                    onClose={() => setPreviewMode(false)}
                    deviceType="phone"
                    showCloseButton={false}
                    floatingElements={<FloatingChat isPreview={true} />}
                  >
                    <PatientLayout
                      blocks={blocks}
                      progress={progress}
                      onBlockUpdate={handleBlockUpdate}
                      onBlockInteraction={handleBlockInteraction}
                      isPreview={true}
                    />
                  </DevicePreview>
                </div>
              )
            : (
          // Editable Blocks Mode
                <div className="h-full p-6 overflow-y-auto">
                  <div className="max-w-4xl mx-auto space-y-6 pb-6">
                    {blocks
                      .map(renderBlock)}
                  </div>
                </div>
              )}
        </div>

        {/* Discharge Input Area - Always visible at bottom */}
        <div className="border-t p-4 bg-muted/30 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <label htmlFor="dischargeText" className="block text-sm font-medium mb-2">
              Paste discharge summary to generate blocks
            </label>
            <div className="flex gap-3">
              <Textarea
                value={dischargeText}
                onChange={e => setDischargeText(e.target.value)}
                className="flex-1 min-h-[100px]"
                placeholder="Patient was admitted with acute appendicitis and underwent laparoscopic appendectomy..."
              />
              <Button
                onClick={handleGenerate}
                disabled={!dischargeText || isGenerating}
                className="px-6"
              >
                {isGenerating
                  ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    )
                  : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Generate Blocks
                      </>
                    )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
