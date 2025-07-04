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

// Mock data for demonstration - Robert Chen STEMI case
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
          clinicName: 'Cardiology - Dr. Martinez',
          description: 'Check your medications and heart health.',
          status: 'already_booked',
          date: new Date('2025-01-08T09:00:00'),
        },
        {
          id: 'appt2',
          clinicName: 'Cardiac Rehabilitation - Heart Center',
          description: 'Intake appointment for cardiac rehab program',
          status: 'already_booked',
          date: new Date('2025-01-15T14:00:00'),
        },
        {
          id: 'appt3',
          clinicName: 'Primary Care - Dr. Williams',
          description: 'General follow-up and medication review',
          status: 'already_booked',
          date: new Date('2025-01-15T10:30:00'),
        },
        {
          id: 'appt4',
          clinicName: 'Endocrinology - Dr. Patel',
          description: 'Diabetes management, consider starting dulaglutide',
          status: 'already_booked',
          date: new Date('2025-01-22T11:00:00'),
        },
        {
          id: 'appt5',
          clinicName: 'Nephrology - Dr. Thompson',
          description: 'Kidney function monitoring (if creatinine remains elevated)',
          status: 'clinic_will_call',
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
          name: 'Aspirin',
          dosage: '81mg',
          frequency: 'Once daily',
          duration: 'Ongoing',
          status: 'unchanged',
          isOTC: true,
          instructions: 'Take with food to reduce stomach irritation',
          taken: false,
          nextDue: new Date(Date.now() + 6 * 60 * 60 * 1000),
        },
        {
          id: 'med2',
          name: 'Ticagrelor',
          dosage: '90mg',
          frequency: 'Twice daily',
          duration: '12 months',
          status: 'new',
          isOTC: false,
          instructions: 'Take at the same times each day. Do not stop without consulting your doctor.',
          taken: false,
          nextDue: new Date(Date.now() + 4 * 60 * 60 * 1000),
        },
        {
          id: 'med3',
          name: 'Metoprolol Succinate',
          dosage: '50mg',
          frequency: 'Once daily',
          duration: 'Ongoing',
          status: 'new',
          isOTC: false,
          instructions: 'Take in the morning. May cause dizziness when standing.',
          taken: false,
          nextDue: new Date(Date.now() + 8 * 60 * 60 * 1000),
        },
        {
          id: 'med4',
          name: 'Atorvastatin',
          dosage: '80mg',
          frequency: 'Once daily',
          duration: 'Ongoing',
          status: 'changed',
          isOTC: false,
          instructions: 'Take in the evening with or without food',
          taken: false,
          nextDue: new Date(Date.now() + 10 * 60 * 60 * 1000),
        },
        {
          id: 'med5',
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: 'Ongoing',
          status: 'changed',
          isOTC: false,
          instructions: 'Reduced dose due to kidney function. Monitor blood pressure.',
          taken: false,
          nextDue: new Date(Date.now() + 8 * 60 * 60 * 1000),
        },
        {
          id: 'med6',
          name: 'Spironolactone',
          dosage: '12.5mg',
          frequency: 'Once daily',
          duration: 'Ongoing',
          status: 'new',
          isOTC: false,
          instructions: 'Take with food. Monitor potassium levels.',
          taken: false,
          nextDue: new Date(Date.now() + 8 * 60 * 60 * 1000),
        },
        {
          id: 'med7',
          name: 'Empagliflozin',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: 'Ongoing',
          status: 'new',
          isOTC: false,
          instructions: 'For heart and kidney protection. Stay well hydrated.',
          taken: false,
          nextDue: new Date(Date.now() + 8 * 60 * 60 * 1000),
        },
        {
          id: 'med8',
          name: 'Insulin Glargine',
          dosage: '20 units',
          frequency: 'Once daily at bedtime',
          duration: 'Ongoing',
          status: 'new',
          isOTC: false,
          instructions: 'Inject subcutaneously. Rotate injection sites.',
          taken: false,
          nextDue: new Date(Date.now() + 14 * 60 * 60 * 1000),
        },
        {
          id: 'med9',
          name: 'Insulin Aspart',
          dosage: 'As per sliding scale',
          frequency: 'Before meals',
          duration: 'Ongoing',
          status: 'new',
          isOTC: false,
          instructions: 'Use sliding scale provided. Check blood sugar before meals.',
          taken: false,
          nextDue: new Date(Date.now() + 2 * 60 * 60 * 1000),
        },
        {
          id: 'med10',
          name: 'Nitroglycerin Sublingual',
          dosage: '0.4mg',
          frequency: 'As needed',
          duration: 'As needed',
          status: 'new',
          isOTC: false,
          instructions: 'For chest pain. Call 000 if pain persists after 3 doses.',
          taken: false,
        },
        {
          id: 'med11',
          name: 'Amlodipine',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: 'Ongoing',
          status: 'unchanged',
          isOTC: false,
          instructions: 'Continue as before',
          taken: false,
          nextDue: new Date(Date.now() + 8 * 60 * 60 * 1000),
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
          id: 'task0',
          title: 'Book GP Appointment',
          description: 'Please book an appointment with your local GP to get a referral.',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          priority: 'high',
          category: 'monitoring',
          completed: false,
        },
        {
          id: 'task1',
          title: 'Monitor blood sugar levels',
          description: 'Check blood sugar before meals and at bedtime. Keep a log.',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          priority: 'high',
          category: 'monitoring',
          completed: false,
        },
        {
          id: 'task2',
          title: 'Take medications as prescribed',
          description: 'Follow the medication schedule carefully. Do not skip doses.',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          priority: 'high',
          category: 'medications',
          completed: false,
        },
        {
          id: 'task3',
          title: 'Monitor for chest pain',
          description: 'Use nitroglycerin as instructed. Call 000 if pain persists.',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          priority: 'high',
          category: 'monitoring',
          completed: false,
        },
        {
          id: 'task4',
          title: 'Gradual activity increase',
          description: 'Begin with light walking. Avoid heavy lifting >5kg for 1 week.',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          category: 'activity',
          completed: false,
        },
        {
          id: 'task5',
          title: 'Monitor kidney function',
          description: 'Watch for changes in urine, swelling in legs/feet.',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          category: 'monitoring',
          completed: false,
        },
        {
          id: 'task6',
          title: 'Heart-healthy diet',
          description: 'Low sodium, diabetic-friendly diet. Limit saturated fats.',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          category: 'lifestyle',
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
          symptom: 'Chest pain or pressure',
          description: 'Any return of chest pain, especially if not relieved by nitroglycerin after 3 doses',
        },
        {
          id: 'symptom2',
          symptom: 'Severe shortness of breath',
          description: 'Difficulty breathing, especially at rest or with minimal activity',
        },
        {
          id: 'symptom3',
          symptom: 'Irregular heartbeat or palpitations',
          description: 'Heart racing, skipping beats, or feeling irregular',
        },
        {
          id: 'symptom4',
          symptom: 'Severe dizziness or fainting',
          description: 'Feeling lightheaded, dizzy, or losing consciousness',
        },
        {
          id: 'symptom5',
          symptom: 'Sudden swelling',
          description: 'Rapid swelling of legs, ankles, or abdomen',
        },
        {
          id: 'symptom6',
          symptom: 'Severe high or low blood sugar',
          description: 'Blood sugar >20 mmol/L or <4 mmol/L with symptoms',
        },
        {
          id: 'symptom7',
          symptom: 'Signs of bleeding',
          description: 'Unusual bruising, black stools, or blood in vomit due to blood thinners',
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
            <h1 className="text-xl font-semibold">Digital Patient Advocate Composer</h1>
            <p className="text-sm text-muted-foreground">Patient: Robert Chen • Discharged Jan 5, 2025</p>
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
                      patientName="Robert Chen"
                      dischargeDate="Jan 5, 2025"
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
