'use client';

import type { AppointmentBlock as AppointmentBlockType, BlockProps } from '@/types/blocks';
import { Calendar, Edit3 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function AppointmentBlock({ block, mode, onUpdate }: BlockProps<AppointmentBlockType>) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (appointmentId: string, field: string, value: string) => {
    if (onUpdate) {
      const updatedBlock = {
        ...block,
        data: {
          ...block.data,
          appointments: block.data.appointments.map(appointment =>
            appointment.id === appointmentId ? { ...appointment, [field]: value } : appointment,
          ),
        },
      };
      onUpdate(updatedBlock);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'patient_to_book':
        return { text: 'Call to Schedule', className: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'clinic_will_call':
        return { text: 'Clinic Will Call', className: 'bg-green-100 text-green-800 border-green-200' };
      case 'already_booked':
        return { text: 'Scheduled', className: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { text: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  if (mode === 'patient') {
    return (
      <Card className="w-full border-green-200">
        <CardHeader className="bg-green-100 border-b border-green-200">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-green-900">
            <Calendar className="w-5 h-5" />
            <span>{block.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {block.data.appointments.map((appointment) => {
            const statusBadge = getStatusBadge(appointment.status);
            return (
              <div key={appointment.id} className="p-4 border-b border-green-100 last:border-b-0 ">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium mb-1 text-gray-900">
                      {appointment.clinicName}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {appointment.description}
                    </div>
                    {appointment.date && appointment.status === 'already_booked' && (
                      <div className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString('en-GB')}
                        {' '}
                        at
                        {' '}
                        {new Date(appointment.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Badge variant="outline" className={`px-3 py-1 text-sm ${statusBadge.className}`}>
                      {statusBadge.text}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  // Doctor edit/preview mode
  return (
    <Card className="w-full bg-green-50 border-green-200">
      <CardHeader className="bg-green-100 border-b border-green-200">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-green-900">
          <Calendar className="w-5 h-5" />
          {mode === 'edit'
            ? (
                <Input
                  value={block.title}
                  onChange={e => onUpdate?.({ ...block, title: e.target.value })}
                  className="font-medium border-none p-0 h-auto bg-transparent text-green-900 flex-1"
                />
              )
            : (
                <span className="flex-1">{block.title}</span>
              )}
          {mode === 'edit' && <Edit3 className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {block.data.appointments.map((appointment) => {
          const statusBadge = getStatusBadge(appointment.status);
          return (
            <div key={appointment.id} className="p-4 border-b border-green-100 last:border-b-0 bg-white">
              {mode === 'edit' && editingId === appointment.id
                ? (
                    <div className="space-y-3">
                      <Input
                        value={appointment.clinicName}
                        onChange={e => handleEdit(appointment.id, 'clinicName', e.target.value)}
                        placeholder="Clinic name"
                      />
                      <Textarea
                        value={appointment.description}
                        onChange={e => handleEdit(appointment.id, 'description', e.target.value)}
                        placeholder="Description"
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <select
                          value={appointment.status}
                          onChange={e => handleEdit(appointment.id, 'status', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="patient_to_book">Patient to Book</option>
                          <option value="clinic_will_call">Clinic Will Call</option>
                          <option value="already_booked">Already Booked</option>
                        </select>
                        <Button size="sm" onClick={() => setEditingId(null)}>Done</Button>
                      </div>
                    </div>
                  )
                : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium mb-1 text-gray-900">
                          {appointment.clinicName}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {appointment.description}
                        </div>
                        {appointment.date && appointment.status === 'already_booked' && (
                          <div className="text-sm text-gray-500">
                            {new Date(appointment.date).toLocaleDateString('en-GB')}
                            {' '}
                            at
                            {' '}
                            {new Date(appointment.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <Badge variant="outline" className={`px-3 py-1 text-sm ${statusBadge.className}`}>
                          {statusBadge.text}
                        </Badge>
                        {mode === 'edit' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(appointment.id)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
            </div>
          );
        })}

        {mode === 'edit' && (
          <div className="p-4 border-t border-green-200">
            <Button variant="outline" className="w-full border-dashed border-green-300 text-green-700">
              + Add Appointment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
