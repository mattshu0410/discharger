'use client';

import type { BlockProps, RedFlagBlock as RedFlagBlockType } from '@/types/blocks';
import { AlertTriangle, Edit3, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { logger } from '@/libs/Logger';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function RedFlagBlock({ block, mode, onUpdate }: BlockProps<RedFlagBlockType>) {
  const [editingSymptomId, setEditingSymptomId] = useState<string | null>(null);

  // React Hook Form setup with reactive values from server state
  const { control, handleSubmit, watch } = useForm({
    values: block, // Reactive sync with entire block from server state
    resetOptions: {
      keepDirtyValues: false, // Don't keep user edits during server updates
    },
  });

  // Watch for immediate UI updates during editing
  const watchedBlock = watch();

  // Field array for managing symptoms dynamically
  const { append, remove } = useFieldArray({
    control,
    name: 'data.symptoms',
  });

  const handleDone = handleSubmit((formData) => {
    if (onUpdate) {
      onUpdate(formData);
    }
    setEditingSymptomId(null);
  });

  const handleDeleteSymptom = async (index: number, symptomName: string) => {
    try {
      const symptomBeingDeleted = watchedBlock.data?.symptoms?.[index];

      // Clear editingSymptomId if we're deleting the currently edited item
      if (symptomBeingDeleted?.id === editingSymptomId) {
        setEditingSymptomId(null);
      }

      remove(index);
      // Wait a tick to ensure state is updated before calling handleDone
      await new Promise(resolve => setTimeout(resolve, 0));
      handleDone();
      toast.success(`Alert "${symptomName}" deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete alert');
      console.error('Failed to delete alert:', error);
    }
  };

  const handleAddSymptom = () => {
    const newSymptom = {
      id: `symptom_${Date.now()}`,
      symptom: '',
      description: '',
    };
    append(newSymptom);
    setEditingSymptomId(newSymptom.id);
  };

  if (mode === 'patient') {
    return (
      <Card className="w-full border-red-200">
        <CardHeader className="bg-red-100 border-b border-red-200">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span>{block.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-red-800">
              If you experience any of these symptoms, call 000 immediately or go to the nearest emergency department.
            </p>
          </div>

          <div className="space-y-3">
            {block.data.symptoms.map(symptom => (
              <div key={symptom.id} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <span className="font-medium text-red-900">{symptom.symptom}</span>
                  {symptom.description && (
                    <p className="text-sm text-red-700 mt-1">{symptom.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Doctor edit/preview mode
  return (
    <Card className="w-full border-red-200">
      <CardHeader className="bg-red-100 border-b border-red-200">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-red-800">
          <AlertTriangle className="w-5 h-5" />
          {mode === 'edit'
            ? (
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="font-medium border-none p-0 h-auto bg-transparent text-red-800 flex-1"
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
      <CardContent className="p-4">
        <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-red-800">
            If you experience any of these symptoms, call 000 immediately or go to the nearest emergency department.
          </p>
        </div>

        <div className="space-y-3">
          {(mode === 'edit' ? watchedBlock.data?.symptoms : block.data.symptoms)?.map((symptom, index) => (
            <div key={symptom.id} className="p-3 border border-red-200 rounded-lg">
              {mode === 'edit' && editingSymptomId === symptom.id
                ? (
                    <div className="space-y-3">
                      <Controller
                        name={`data.symptoms.${index}.symptom`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Symptom name"
                          />
                        )}
                      />
                      <Controller
                        name={`data.symptoms.${index}.description`}
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Symptom description"
                            className="min-h-[60px]"
                          />
                        )}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleDone} type="button">Done</Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const symptomName = symptom.symptom || 'Alert';
                            handleDeleteSymptom(index, symptomName);
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
                      <div className="flex items-start gap-2 flex-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <span className="font-medium text-red-900">{symptom.symptom}</span>
                          {symptom.description && (
                            <p className="text-sm text-red-700 mt-1">{symptom.description}</p>
                          )}
                        </div>
                      </div>
                      {mode === 'edit' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSymptomId(symptom.id)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
            </div>
          ))}
        </div>

        {mode === 'edit' && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full border-dashed border-red-300 text-red-700"
              onClick={handleAddSymptom}
              type="button"
            >
              + Add Red Flag Symptom
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
