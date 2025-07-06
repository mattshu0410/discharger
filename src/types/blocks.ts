// Block system type definitions for patient portal

export type BlockType = 'text' | 'medication' | 'task' | 'redFlag' | 'appointment';

export type BaseBlock = {
  id: string;
  type: BlockType;
  title: string;
  isEditable: boolean;
  isRequired: boolean;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
};

export type TextBlock = {
  type: 'text';
  data: {
    content: string;
    format: 'plain' | 'rich';
  };
} & BaseBlock;

export type MedicationBlock = {
  type: 'medication';
  data: {
    medications: Array<{
      id: string;
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      status: 'new' | 'changed' | 'unchanged' | 'stopped';
      instructions?: string;
    }>;
    groupBy: 'status';
  };
} & BaseBlock;

export type TaskBlock = {
  type: 'task';
  data: {
    tasks: Array<{
      id: string;
      title: string;
      description: string;
      dueDate?: Date;
      priority: 'high' | 'medium' | 'low';
      completed: boolean;
      completedAt?: Date;
    }>;
    enableReminders: boolean;
    groupBy: 'priority' | 'dueDate';
  };
} & BaseBlock;

export type RedFlagBlock = {
  type: 'redFlag';
  data: {
    symptoms: Array<{
      id: string;
      symptom: string;
      description: string;
    }>;
  };
} & BaseBlock;

export type AppointmentBlock = {
  type: 'appointment';
  data: {
    appointments: Array<{
      id: string;
      clinicName: string;
      description: string;
      status: 'patient_to_book' | 'clinic_will_call' | 'already_booked';
      date?: Date;
    }>;
  };
} & BaseBlock;

export type Block = TextBlock | MedicationBlock | TaskBlock | RedFlagBlock | AppointmentBlock;

export type BlockMode = 'edit' | 'preview' | 'patient';

export type BlockProps<T extends Block = Block> = {
  block: T;
  mode: BlockMode;
  onUpdate?: (block: T) => void;
  onInteraction?: (interactionType: string, data: any) => void;
};

export type PatientProgress = {
  totalTasks: number;
  completedTasks: number;
  medicationsTaken: number;
  totalMedications: number;
  appointmentsScheduled: number;
  totalAppointments: number;
  overallCompletion: number;
};
