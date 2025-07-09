'use client';

import type { SupportedLocale } from '@/api/patient-summaries/types';
import type { Block, PatientProgress } from '@/types/blocks';
import { Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  usePatientSummary,
  usePatientSummaryTranslation,
  usePatientSummaryTranslations,
  useTranslatePatientSummary,
  useUpdatePatientSummaryLocale,
} from '@/api/patient-summaries/hooks';
import { AppointmentBlock } from '@/components/blocks/AppointmentBlock';
import { MedicationBlock } from '@/components/blocks/MedicationBlock';
import { RedFlagBlock } from '@/components/blocks/RedFlagBlock';
import { TaskBlock } from '@/components/blocks/TaskBlock';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingBlock } from '@/components/ui/loading-block';

type PatientLayoutProps = {
  blocks: Block[];
  progress: PatientProgress;
  onBlockUpdate: (blockId: string, updatedBlock: Block) => void;
  onBlockInteraction?: (blockId: string, interactionType: string, data: any) => void;
  isPreview?: boolean;
  patientName?: string;
  dischargeDate?: string;
  // Patient summary ID for translation functionality
  patientSummaryId?: string;
  // Access key for public access to translation
  patientAccessKey?: string;
};

export function PatientLayout({
  blocks,
  // progress,
  onBlockUpdate,
  onBlockInteraction,
  isPreview = false,
  patientName = 'John Doe',
  dischargeDate = 'Jan 15, 2024',
  patientSummaryId,
  patientAccessKey,
}: PatientLayoutProps) {
  // Translation state and hooks
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('en');

  // React Query hooks for translation functionality - unified pattern
  const { data: summary } = usePatientSummary(patientSummaryId || '', {
    accessKey: patientAccessKey,
  });
  const { data: translations = [] } = usePatientSummaryTranslations(patientSummaryId || '', {
    accessKey: patientAccessKey,
  });
  const { data: currentTranslation, isLoading: isLoadingTranslation } = usePatientSummaryTranslation(
    patientSummaryId || '',
    currentLocale,
    {
      enabled: !!patientSummaryId && currentLocale !== summary?.preferred_locale,
      accessKey: patientAccessKey,
    },
  );

  // Mutations
  const translateMutation = useTranslatePatientSummary();
  const updateLocaleMutation = useUpdatePatientSummaryLocale();

  // Update current locale when summary is loaded
  useEffect(() => {
    if (summary?.preferred_locale) {
      setCurrentLocale(summary.preferred_locale as SupportedLocale);
    }
  }, [summary?.preferred_locale]);

  // Calculate available translations
  const availableTranslations = translations.map(t => t.locale as SupportedLocale);
  if (summary?.preferred_locale && !availableTranslations.includes(summary.preferred_locale as SupportedLocale)) {
    availableTranslations.push(summary.preferred_locale as SupportedLocale);
  }

  // Determine which blocks to display
  const displayBlocks = (() => {
    if (!patientSummaryId || !summary) {
      return blocks; // Use fallback blocks if no summary
    }

    // If current locale is the original, use original blocks
    if (currentLocale === summary.preferred_locale) {
      return summary.blocks;
    }

    // If we have a translation for current locale, use translated blocks
    if (currentTranslation) {
      return currentTranslation.translated_blocks;
    }

    // Fallback to original blocks
    return summary.blocks;
  })();

  // Handle language switching
  const handleLocaleChange = async (locale: SupportedLocale) => {
    if (!patientSummaryId || !summary || locale === currentLocale) {
      return;
    }

    setCurrentLocale(locale);

    // If switching to original language, just update locale preference
    if (locale === summary.preferred_locale) {
      return;
    }

    //
    //  if translation exists
    const existingTranslation = translations.find(t => t.locale === locale);
    if (existingTranslation) {
      return; // Translation already exists, React Query will handle loading
    }

    // Create new translation
    try {
      const translateRequest: any = {
        patient_summary_id: patientSummaryId,
        target_locale: locale,
      };

      // Include access key for public access
      if (patientAccessKey) {
        translateRequest.access_key = patientAccessKey;
      }

      await translateMutation.mutateAsync(translateRequest);
      toast.success(`Translation to ${locale} created successfully!`);
    } catch (error) {
      console.error('Failed to create translation:', error);
      toast.error('Failed to create translation. Please try again.');
      // Revert to previous locale on error
      setCurrentLocale(summary.preferred_locale as SupportedLocale);
    }
  };

  const isTranslating = translateMutation.isPending;
  const isUpdatingLocale = updateLocaleMutation.isPending;
  const isLoading = isTranslating || isUpdatingLocale || isLoadingTranslation;

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
    <div className="min-h-full bg-gradient-to-b from-primary-50 to-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pt-12 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold">{patientName}</h1>
              {' '}
              <p className="text-primary-foreground/80 text-sm">
                Discharged on
                {' '}
                {dischargeDate}
              </p>
              {isPreview && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  Preview Mode
                </Badge>
              )}
            </div>
            {patientSummaryId && (
              <LanguageSwitcher
                currentLocale={currentLocale}
                onLocaleChange={handleLocaleChange}
                isUpdatingLocale={isUpdatingLocale}
                isTranslating={isTranslating}
                availableTranslations={availableTranslations}
                variant="header"
              />
            )}
          </div>

          {/* Progress Bar - Hidden for now, will be implemented later */}
          {/*
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
          */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
        {/* Welcome Message */}
        <Card className="border-primary">
          <CardContent className="p-4">
            <h2 className="font-semibold text-primary mb-2">Welcome to Your Recovery Guide</h2>
            <p className="text-sm text-muted-foreground">
              This personalised guide will help you track your appointments, medications, complete important tasks, and know when to seek help.
            </p>
          </CardContent>
        </Card>

        {/* Blocks */}
        {isLoading
          ? Array.from({ length: displayBlocks.length }, (_, index) => (
              <LoadingBlock key={`loading-${index}`} />
            ))
          : displayBlocks.map(renderBlock)}

        {/* Emergency Contact Card */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-900">Emergency Contact</span>
            </div>
            <p className="text-sm text-red-700 mb-3">
              For any emergency, please call Triple Zero 000.
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                disabled={isPreview}
              >
                <Phone className="w-4 h-4 mr-1" />
                Call 000
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p></p>
        </div>
      </div>
    </div>
  );
}
