'use client';

import type { BlockProps, MedicationBlock as MedicationBlockType } from '@/types/blocks';
import { Edit3, Pill } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function MedicationBlock({ block, mode, onUpdate }: BlockProps<MedicationBlockType>) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (medicationId: string, field: string, value: string) => {
    if (onUpdate) {
      const updatedBlock = {
        ...block,
        data: {
          ...block.data,
          medications: block.data.medications.map(med =>
            med.id === medicationId ? { ...med, [field]: value } : med,
          ),
        },
      };
      onUpdate(updatedBlock);
    }
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
      <Card className="w-full border-blue-200">
        <CardHeader className="bg-blue-100 border-b border-blue-200">
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
    <Card className="w-full bg-blue-50 border-blue-200">
      <CardHeader className="bg-blue-100 border-b border-blue-200">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-900">
          <Pill className="w-5 h-5" />
          {mode === 'edit'
            ? (
                <Input
                  value={block.title}
                  onChange={e => onUpdate?.({ ...block, title: e.target.value })}
                  className="font-medium border-none p-0 h-auto bg-transparent text-blue-900 flex-1"
                />
              )
            : (
                <span className="flex-1">{block.title}</span>
              )}
          {mode === 'edit' && <Edit3 className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {block.data.medications.map(medication => (
          <div key={medication.id} className="p-4 border-b border-blue-100 last:border-b-0 bg-white">
            {mode === 'edit' && editingId === medication.id
              ? (
                  <div className="space-y-3">
                    <Input
                      value={medication.name}
                      onChange={e => handleEdit(medication.id, 'name', e.target.value)}
                      placeholder="Medication name"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={medication.dosage}
                        onChange={e => handleEdit(medication.id, 'dosage', e.target.value)}
                        placeholder="Dosage"
                      />
                      <Input
                        value={medication.frequency}
                        onChange={e => handleEdit(medication.id, 'frequency', e.target.value)}
                        placeholder="Frequency"
                      />
                    </div>
                    <Input
                      value={medication.instructions || ''}
                      onChange={e => handleEdit(medication.id, 'instructions', e.target.value)}
                      placeholder="Instructions"
                    />
                    <div className="flex gap-2">
                      <select
                        value={medication.status}
                        onChange={e => handleEdit(medication.id, 'status', e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="new">New</option>
                        <option value="changed">Changed</option>
                        <option value="unchanged">Unchanged</option>
                        <option value="stopped">Stopped</option>
                      </select>
                      <Button size="sm" onClick={() => setEditingId(null)}>Done</Button>
                    </div>
                  </div>
                )
              : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className={`font-medium mb-1 ${getMedicationClassName(medication.status)}`}>
                        {medication.name}
                        {' '}
                        {medication.dosage}
                        <Badge variant="outline" className={`ml-2 ${getStatusColor(medication.status)}`}>
                          {medication.status}
                        </Badge>
                      </div>
                      <div className={`text-sm ${getMedicationClassName(medication.status)}`}>
                        {medication.instructions || medication.frequency}
                      </div>
                    </div>
                    <div className="ml-4">
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
            <Button variant="outline" className="w-full border-dashed border-blue-300 text-blue-700">
              + Add Medication
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
