'use client';

import type { BlockProps, MedicationBlock as MedicationBlockType } from '@/types/blocks';
import { Edit3, Pill, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// import { logger } from '@/libs/Logger';

export function MedicationBlock({ block, mode, onUpdate }: BlockProps<MedicationBlockType>) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // React Hook Form setup with reactive values from server state
  const { control, handleSubmit, watch } = useForm({
    values: block, // Reactive sync with entire block from server state
    resetOptions: {
      keepDirtyValues: false, // Keep user edits during server updates
    },
  });

  // Watch for immediate UI updates during editing
  const watchedBlock = watch();

  // Debug: Watch for state changes
  useEffect(() => {
    // logger.debug('Server state changed:', {
    //   medications: block.data.medications?.map(m => ({ id: m.id, name: m.name })),
    //   count: block.data.medications?.length,
    // });
  }, [block.data.medications]);

  useEffect(() => {
    // logger.debug('Form state changed:', {
    //   medications: watchedBlock.data?.medications?.map(m => ({ id: m.id, name: m.name })),
    //   count: watchedBlock.data?.medications?.length,
    // });
  }, [watchedBlock.data?.medications]);

  useEffect(() => {
    // logger.debug('EditingId changed:', editingId);
  }, [editingId]);

  // Field array for managing medications dynamically
  const { append, remove } = useFieldArray({
    control,
    name: 'data.medications',
  });

  const handleDone = handleSubmit((formData) => {
    // logger.debug('handleDone - Sending to server:', {
    //   formData: formData.data.medications,
    //   editingId,
    // });
    if (onUpdate) {
      onUpdate(formData);
    }
    setEditingId(null);
  });

  const handleDeleteMedication = async (index: number, medicationName: string) => {
    try {
      const medicationBeingDeleted = watchedBlock.data?.medications?.[index];

      // logger.debug('Before delete:', {
      //   index,
      //   medicationBeingDeleted,
      //   watchedMeds: watchedBlock.data?.medications?.map(m => ({ id: m.id, name: m.name })),
      //   serverMeds: block.data.medications?.map(m => ({ id: m.id, name: m.name })),
      //   editingId,
      //   willClearEditingId: medicationBeingDeleted?.id === editingId,
      // });

      // Clear editingId if we're deleting the currently edited item
      if (medicationBeingDeleted?.id === editingId) {
        // logger.debug('Clearing editingId');
        setEditingId(null);
      }

      remove(index);
      // logger.debug('After remove:', {
      //   watchedMeds: watchedBlock.data?.medications?.map(m => ({ id: m.id, name: m.name })),
      // });

      // Wait a tick to ensure state is updated before calling handleDone
      await new Promise(resolve => setTimeout(resolve, 0));
      handleDone();
      toast.success(`Medication "${medicationName}" deleted successfully`);
    } catch (error) {
      // logger.error('Delete error:', error);
      toast.error('Failed to delete medication');
      console.error('Failed to delete medication:', error);
    }
  };

  const handleAddMedication = () => {
    const newMedication = {
      id: `med_${Date.now()}`,
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      status: 'new' as const,
      instructions: '',
    };
    // logger.debug('Adding medication:', newMedication);
    append(newMedication);
    setEditingId(newMedication.id);
    // logger.debug('Set editingId to:', newMedication.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800 border-green-200';
      case 'changed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unchanged': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'stopped': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMedicationClassName = (status: string) => {
    if (status === 'stopped') {
      return 'text-gray-400 line-through';
    }
    return 'text-gray-900';
  };

  if (mode === 'patient') {
    return (
      <Card className="w-full border-blue-200 bg-white rounded-lg">
        <CardHeader className="bg-blue-100 border-b border-blue-200 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-blue-900">
            <Pill className="w-5 h-5" />
            <span>{block.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {block.data.medications.map(medication => (
            <div key={medication.id} className="p-4 border-b border-blue-100 last:border-b-0 ">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className={`font-medium mb-1 ${getMedicationClassName(medication.status)}`}>
                    {medication.name}
                  </div>
                  <div className={`text-sm text-gray-600 mb-1 ${getMedicationClassName(medication.status)}`}>
                    {medication.dosage}
                    {' '}
                    •
                    {' '}
                    {medication.frequency}
                  </div>
                  {medication.instructions && (
                    <div className={`text-sm text-muted-foreground ${getMedicationClassName(medication.status)}`}>
                      {medication.instructions}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <Badge variant="outline" className={`px-3 py-1 text-sm ${getStatusColor(medication.status)}`}>
                    {medication.status === 'unchanged' ? 'Continue' : medication.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Doctor edit/preview mode
  return (
    <Card className="w-full bg-blue-50 border-blue-200 rounded-lg">
      <CardHeader className="bg-blue-100 border-b border-blue-200 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-900">
          <Pill className="w-5 h-5" />
          {mode === 'edit'
            ? (
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="font-medium border-none p-0 h-auto bg-transparent text-blue-900 flex-1"
                    />
                  )}
                />
              )
            : (
                <span className="flex-1">{block.title}</span>
              )}
          {mode === 'edit' && <Edit3 className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {(mode === 'edit' ? watchedBlock.data?.medications : block.data.medications)?.map((medication, index) => (
          <div key={medication.id} className="p-4 border-b border-blue-100 last:border-b-0 bg-white">
            {mode === 'edit' && editingId === medication.id
              ? (
                  <div className="space-y-3">
                    <Controller
                      name={`data.medications.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Medication name"
                        />
                      )}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Controller
                        name={`data.medications.${index}.dosage`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Dosage"
                          />
                        )}
                      />
                      <Controller
                        name={`data.medications.${index}.frequency`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Frequency"
                          />
                        )}
                      />
                    </div>
                    <Controller
                      name={`data.medications.${index}.instructions`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          value={field.value || ''}
                          placeholder="Instructions"
                        />
                      )}
                    />
                    <div className="flex gap-2">
                      <Controller
                        name={`data.medications.${index}.status`}
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="new">New</option>
                            <option value="changed">Changed</option>
                            <option value="unchanged">Unchanged</option>
                            <option value="stopped">Stopped</option>
                          </select>
                        )}
                      />
                      <Button size="sm" onClick={handleDone} type="button">Done</Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const medicationName = medication.name || 'Medication';
                          handleDeleteMedication(index, medicationName);
                        }}
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className={`font-medium mb-1 ${getMedicationClassName(medication.status)}`}>
                        {medication.name}
                      </div>
                      {' '}
                      <div className={`text-sm text-gray-600 mb-1 ${getMedicationClassName(medication.status)}`}>
                        {medication.dosage}
                        {' '}
                        •
                        {' '}
                        {medication.frequency}

                      </div>

                      <div className={`text-sm ${getMedicationClassName(medication.status)}`}>
                        {medication.instructions || medication.frequency}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <Badge variant="outline" className={`px-3 py-1 text-sm ml-2 ${getStatusColor(medication.status)}`}>
                        {medication.status}
                      </Badge>
                      {mode === 'edit' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(medication.id)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
          </div>
        ))}

        {mode === 'edit' && (
          <div className="p-4 border-t border-blue-200">
            <Button
              variant="outline"
              className="w-full border-dashed border-blue-300 text-blue-700"
              onClick={handleAddMedication}
              type="button"
            >
              + Add Medication
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
