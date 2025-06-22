'use client';

import type { Block, PatientProgress } from '@/types/blocks';
import { Globe, MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';
import { AppointmentBlock } from '@/components/blocks/AppointmentBlock';
import { MedicationBlock } from '@/components/blocks/MedicationBlock';
import { RedFlagBlock } from '@/components/blocks/RedFlagBlock';
import { TaskBlock } from '@/components/blocks/TaskBlock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export type FloatingChatProps = {
  isPreview?: boolean;
};

export const FloatingChat = ({ isPreview = false }: FloatingChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(!isPreview);

  return (
    <div className="absolute bottom-4 right-4 z-50">
      {isOpen
        ? (
            <Card className="w-80 h-96 shadow-xl border-2">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Medical Assistant</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    ×
                  </Button>
                </div>

                <div className="flex-1 bg-muted/30 rounded-lg p-3 mb-3 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="bg-primary/10 p-3 rounded-lg text-sm border border-primary/20">
                      Hi John! I'm here to help with any questions about your recovery. How are you feeling today?
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Suggested questions:</p>
                      <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2 text-left">
                        When should I take my next medication?
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2 text-left">
                        What activities should I avoid?
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2 text-left">
                        I'm experiencing mild pain, is this normal?
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type your question..."
                    className="flex-1"
                    disabled={isPreview}
                  />
                  <Button size="sm" disabled={isPreview}>
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        : (
            <Button
              className="w-14 h-14 rounded-full shadow-xl relative hover:scale-105 transition-transform"
              onClick={() => {
                setIsOpen(true);
                setHasUnread(false);
              }}
            >
              <MessageCircle className="w-6 h-6" />
              {hasUnread && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-red-500 hover:bg-red-500 animate-pulse">
                  !
                </Badge>
              )}
            </Button>
          )}
    </div>
  );
};

type PatientLayoutProps = {
  blocks: Block[];
  progress: PatientProgress;
  onBlockUpdate: (blockId: string, updatedBlock: Block) => void;
  onBlockInteraction?: (blockId: string, interactionType: string, data: any) => void;
  isPreview?: boolean;
  patientName?: string;
  dischargeDate?: string;
};

export function PatientLayout({
  blocks,
  progress,
  onBlockUpdate,
  onBlockInteraction,
  isPreview = false,
  patientName = 'John Doe',
  dischargeDate = 'Jan 15, 2024',
}: PatientLayoutProps) {
  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'medication':
        return (
          <MedicationBlock
            key={block.id}
            block={block}
            mode="patient"
            onUpdate={updatedBlock => onBlockUpdate(block.id, updatedBlock)}
            onInteraction={(type, data) => onBlockInteraction?.(block.id, type, data)}
          />
        );
      case 'task':
        return (
          <TaskBlock
            key={block.id}
            block={block}
            mode="patient"
            onUpdate={updatedBlock => onBlockUpdate(block.id, updatedBlock)}
            onInteraction={(type, data) => onBlockInteraction?.(block.id, type, data)}
          />
        );
      case 'redFlag':
        return (
          <RedFlagBlock
            key={block.id}
            block={block}
            mode="patient"
            onUpdate={updatedBlock => onBlockUpdate(block.id, updatedBlock)}
            onInteraction={(type, data) => onBlockInteraction?.(block.id, type, data)}
          />
        );
      case 'appointment':
        return (
          <AppointmentBlock
            key={block.id}
            block={block}
            mode="patient"
            onUpdate={updatedBlock => onBlockUpdate(block.id, updatedBlock)}
            onInteraction={(type, data) => onBlockInteraction?.(block.id, type, data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-primary-50 to-background relative">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold">{patientName}</h1>
              <p className="text-primary-foreground/80 text-sm">
                Discharged
                {dischargeDate}
              </p>
              {isPreview && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  Preview Mode
                </Badge>
              )}
            </div>
            <Button variant="secondary" size="sm" disabled={isPreview}>
              <Globe className="w-4 h-4 mr-1" />
              EN
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>
                {progress.completedTasks}
                /
                {progress.totalTasks}
                {' '}
                tasks completed
              </span>
            </div>
            <Progress value={progress.overallCompletion} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
        {/* Welcome Message */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <h2 className="font-semibold text-primary mb-2">Welcome to Your Recovery Guide</h2>
            <p className="text-sm text-muted-foreground">
              This personalized guide will help you track your medications, complete important tasks,
              and know when to seek help. Your progress is automatically saved.
            </p>
          </CardContent>
        </Card>

        {/* Blocks */}
        {blocks.map(renderBlock)}

        {/* Emergency Contact Card */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-900">24/7 Support</span>
            </div>
            <p className="text-sm text-red-700 mb-3">
              If you have any concerns about your recovery, don't hesitate to reach out.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={isPreview}
              asChild
            >
              <a href="tel:000">
                <Phone className="w-4 h-4 mr-1" />
                Call 000
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>Generated by Discharger • Your personalized recovery companion</p>
        </div>
      </div>

    </div>
  );
}
