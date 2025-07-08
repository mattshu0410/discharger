'use client';

import type { Block } from '@/types/blocks';
import { format } from 'date-fns';
import { AlertTriangle, Calendar, CheckSquare, Phone, Pill } from 'lucide-react';

type PatientSummaryPDFProps = {
  patientName: string;
  dischargeDate?: string;
  blocks: Block[];
};

export function PatientSummaryPDF({
  patientName,
  dischargeDate,
  blocks,
}: PatientSummaryPDFProps) {
  // PDF-specific styles to avoid oklch and other unsupported CSS functions
  const pdfStyles = {
    container: { backgroundColor: '#ffffff', padding: '12px', maxWidth: '794px', margin: '0 auto', fontSize: '11px' },
    header: { marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb' },
    title: { fontSize: '14px', fontWeight: 'bold', marginBottom: '2px', color: '#000000' },
    subtitle: { color: '#6b7280', fontSize: '10px' },
    blockHeader: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' },
    blockTitle: { fontSize: '12px', fontWeight: '600', color: '#000000' },
    blockContainer: { marginBottom: '8px' },
    itemContainer: { marginBottom: '6px' },
    item: { border: '1px solid #e5e7eb', borderRadius: '4px', padding: '4px 6px', backgroundColor: '#f9fafb', fontSize: '10px' },
    itemTitle: { fontWeight: '500', color: '#000000', fontSize: '11px', marginBottom: '1px' },
    itemSubtitle: { fontSize: '10px', color: '#6b7280', marginTop: '1px' },
    itemDescription: { fontSize: '10px', marginTop: '1px', color: '#374151' },
    redFlagItem: { border: '1px solid #fecaca', borderRadius: '4px', padding: '4px 6px', backgroundColor: '#fef2f2', fontSize: '10px' },
    redFlagTitle: { fontWeight: '500', color: '#991b1b', fontSize: '11px', marginBottom: '1px' },
    redFlagDescription: { fontSize: '10px', color: '#dc2626', marginTop: '1px' },
    emergencyBox: { marginTop: '8px', padding: '6px 8px', border: '1px solid #ef4444', borderRadius: '4px', backgroundColor: '#fef2f2' },
    emergencyHeader: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' },
    emergencyTitle: { fontWeight: '600', color: '#991b1b', fontSize: '11px' },
    emergencyText: { color: '#dc2626', fontSize: '10px', margin: 0 },
    footer: { marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #e5e7eb', textAlign: 'center' as const, fontSize: '9px', color: '#6b7280' },
  };
  const renderMedicationBlock = (block: Block) => {
    if (block.type !== 'medication') {
      return null;
    }
    const { medications = [], groupBy = 'none' } = block.data;

    // Group medications if needed
    const groupedMedications = groupBy === 'status'
      ? medications.reduce((acc, med) => {
          const status = med.status || 'unchanged';
          if (!acc[status]) {
            acc[status] = [];
          }
          acc[status].push(med);
          return acc;
        }, {} as Record<string, typeof medications>)
      : { all: medications };

    const statusLabels = {
      new: 'New Medications',
      changed: 'Changed Medications',
      unchanged: 'Continuing Medications',
      stopped: 'Stopped Medications',
    };

    return (
      <div style={pdfStyles.blockContainer}>
        <div style={pdfStyles.blockHeader}>
          <Pill size={12} />
          <h2 style={pdfStyles.blockTitle}>{block.title || 'Medications'}</h2>
        </div>
        {Object.entries(groupedMedications).map(([status, meds]) => (
          <div key={status} style={pdfStyles.itemContainer}>
            {groupBy === 'status' && (
              <h3 style={{ fontWeight: '500', fontSize: '10px', marginBottom: '2px' }}>{statusLabels[status as keyof typeof statusLabels]}</h3>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {meds.map(med => (
                <div key={med.id} style={pdfStyles.item}>
                  <div style={pdfStyles.itemTitle}>{med.name}</div>
                  <div style={pdfStyles.itemSubtitle}>
                    {med.dosage}
                    {' '}
                    -
                    {med.frequency}
                    {med.duration && ` for ${med.duration}`}
                  </div>
                  {med.instructions && (
                    <div style={pdfStyles.itemDescription}>{med.instructions}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTaskBlock = (block: Block) => {
    if (block.type !== 'task') {
      return null;
    }
    const { tasks = [], groupBy = 'none' } = block.data;

    // Group tasks if needed
    const groupedTasks = groupBy === 'priority'
      ? tasks.reduce((acc, task) => {
          const priority = task.priority || 'medium';
          if (!acc[priority]) {
            acc[priority] = [];
          }
          acc[priority].push(task);
          return acc;
        }, {} as Record<string, typeof tasks>)
      : { all: tasks };

    const priorityLabels = {
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
    };

    const priorityOrder = ['high', 'medium', 'low'];

    return (
      <div style={pdfStyles.blockContainer}>
        <div style={pdfStyles.blockHeader}>
          <CheckSquare size={12} />
          <h2 style={pdfStyles.blockTitle}>{block.title || 'Tasks'}</h2>
        </div>
        {Object.entries(groupedTasks)
          .sort(([a], [b]) => {
            if (groupBy === 'priority') {
              return priorityOrder.indexOf(a) - priorityOrder.indexOf(b);
            }
            return 0;
          })
          .map(([group, tasks]) => (
            <div key={group} style={pdfStyles.itemContainer}>
              {groupBy === 'priority' && (
                <h3 style={{ fontWeight: '500', fontSize: '10px', marginBottom: '2px' }}>{priorityLabels[group as keyof typeof priorityLabels]}</h3>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {tasks.map(task => (
                  <div key={task.id} style={pdfStyles.item}>
                    <div style={pdfStyles.itemTitle}>{task.title}</div>
                    {task.description && (
                      <div style={pdfStyles.itemSubtitle}>{task.description}</div>
                    )}
                    {task.dueDate && (
                      <div style={pdfStyles.itemDescription}>
                        Due:
                        {' '}
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    );
  };

  const renderAppointmentBlock = (block: Block) => {
    if (block.type !== 'appointment') {
      return null;
    }
    const { appointments = [] } = block.data;

    return (
      <div style={pdfStyles.blockContainer}>
        <div style={pdfStyles.blockHeader}>
          <Calendar size={12} />
          <h2 style={pdfStyles.blockTitle}>{block.title || 'Appointments'}</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {appointments.map(apt => (
            <div key={apt.id} style={pdfStyles.item}>
              <div style={pdfStyles.itemTitle}>{apt.clinicName}</div>
              {apt.description && (
                <div style={pdfStyles.itemSubtitle}>{apt.description}</div>
              )}
              <div style={pdfStyles.itemDescription}>
                {apt.status === 'already_booked' && apt.date
                  ? format(new Date(apt.date), 'MMM d, yyyy h:mm a')
                  : 'Clinic will contact you to schedule'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRedFlagBlock = (block: Block) => {
    if (block.type !== 'redFlag') {
      return null;
    }
    const { symptoms = [] } = block.data;

    return (
      <div style={pdfStyles.blockContainer}>
        <div style={pdfStyles.blockHeader}>
          <AlertTriangle size={12} color="#ef4444" />
          <h2 style={pdfStyles.blockTitle}>{block.title || 'When to Seek Help'}</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {symptoms.map(symptom => (
            <div key={symptom.id} style={pdfStyles.redFlagItem}>
              <div style={pdfStyles.redFlagTitle}>{symptom.symptom}</div>
              {symptom.description && (
                <div style={pdfStyles.redFlagDescription}>{symptom.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'medication':
        return renderMedicationBlock(block);
      case 'task':
        return renderTaskBlock(block);
      case 'appointment':
        return renderAppointmentBlock(block);
      case 'redFlag':
        return renderRedFlagBlock(block);
      default:
        return null;
    }
  };

  return (
    <div style={pdfStyles.container}>
      {/* Header */}
      <div style={pdfStyles.header}>
        <h1 style={pdfStyles.title}>Discharge Summary</h1>
        <div style={pdfStyles.subtitle}>
          <div>
            Patient:
            {patientName}
          </div>
          <div>
            Discharged:
            {dischargeDate || format(new Date(), 'MMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Blocks */}
      <div>
        {blocks.map(block => (
          <div key={block.id} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            {renderBlock(block)}
          </div>
        ))}
      </div>

      {/* Emergency Contact */}
      <div style={pdfStyles.emergencyBox}>
        <div style={pdfStyles.emergencyHeader}>
          <Phone size={12} color="#ef4444" />
          <span style={pdfStyles.emergencyTitle}>Emergency Contact</span>
        </div>
        <p style={pdfStyles.emergencyText}>For any emergency, please call Triple Zero 000.</p>
      </div>

      {/* Footer */}
      <div style={pdfStyles.footer}>
        <p>
          Generated on
          {' '}
          {format(new Date(), 'MMM d, yyyy h:mm a')}
        </p>
      </div>
    </div>
  );
}
