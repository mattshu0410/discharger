'use client';

import { usePostHog } from 'posthog-js/react';

export type ContentCopyData = {
  section_id: string;
  section_title: string;
  content_length: number;
  copy_method: 'copy_button' | 'manual_selection';
  has_citations: boolean;
  citation_count: number;
};

export type DischargeGenerationData = {
  patient_id: string;
  context_length: number;
  document_count: number;
};

const CURRENT_GENERATION_SESSION_KEY = 'current_discharge_generation_session';
const CURRENT_GENERATION_TIMESTAMP_KEY = 'current_discharge_generation_timestamp';
const CURRENT_GENERATION_CONVERTED_KEY = 'current_discharge_generation_converted';

export const useAnalytics = () => {
  const posthog = usePostHog();

  const generateSessionId = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const trackDischargeGenerationStarted = (data: DischargeGenerationData) => {
    try {
      const sessionId = generateSessionId();
      const timestamp = new Date().toISOString();

      // Clear any previous generation session and reset conversion tracking
      sessionStorage.setItem(CURRENT_GENERATION_SESSION_KEY, sessionId);
      sessionStorage.setItem(CURRENT_GENERATION_TIMESTAMP_KEY, timestamp);
      sessionStorage.removeItem(CURRENT_GENERATION_CONVERTED_KEY);

      posthog?.capture('discharge_generation_started', {
        session_id: sessionId,
        patient_id: data.patient_id,
        context_length: data.context_length,
        document_count: data.document_count,
        timestamp,
      });
    } catch (error) {
      console.error('Failed to track discharge generation started:', error);
    }
  };

  const trackDischargeGenerationCompleted = (data: DischargeGenerationData & { section_count: number }) => {
    try {
      const sessionId = sessionStorage.getItem(CURRENT_GENERATION_SESSION_KEY);
      const startTimestamp = sessionStorage.getItem(CURRENT_GENERATION_TIMESTAMP_KEY);
      const completedTimestamp = new Date().toISOString();

      posthog?.capture('discharge_generation_completed', {
        session_id: sessionId,
        patient_id: data.patient_id,
        context_length: data.context_length,
        document_count: data.document_count,
        section_count: data.section_count,
        generation_duration: startTimestamp
          ? (new Date(completedTimestamp).getTime() - new Date(startTimestamp).getTime()) / 1000
          : null,
        timestamp: completedTimestamp,
      });
    } catch (error) {
      console.error('Failed to track discharge generation completed:', error);
    }
  };

  const trackContentCopy = (data: ContentCopyData) => {
    try {
      const sessionId = sessionStorage.getItem(CURRENT_GENERATION_SESSION_KEY);
      const generationTimestamp = sessionStorage.getItem(CURRENT_GENERATION_TIMESTAMP_KEY);
      const hasAlreadyConverted = sessionStorage.getItem(CURRENT_GENERATION_CONVERTED_KEY);
      const copyTimestamp = new Date().toISOString();

      // Check if this copy event represents a new conversion for the current generation
      const isConversion = sessionId && generationTimestamp && !hasAlreadyConverted;

      if (isConversion) {
        // Mark this generation as converted to prevent duplicate conversion events
        sessionStorage.setItem(CURRENT_GENERATION_CONVERTED_KEY, 'true');

        // Track conversion event - this generation led to usage
        posthog?.capture('discharge_conversion_generated_to_copied', {
          session_id: sessionId,
          section_id: data.section_id,
          section_title: data.section_title,
          copy_method: data.copy_method,
          time_to_copy: (new Date(copyTimestamp).getTime() - new Date(generationTimestamp).getTime()) / 1000,
          timestamp: copyTimestamp,
        });
      }

      // Always track the individual copy event
      posthog?.capture('discharge_content_copied', {
        session_id: sessionId,
        section_id: data.section_id,
        section_title: data.section_title,
        content_length: data.content_length,
        copy_method: data.copy_method,
        has_citations: data.has_citations,
        citation_count: data.citation_count,
        is_conversion: isConversion,
        timestamp: copyTimestamp,
      });
    } catch (error) {
      console.error('Failed to track content copy:', error);
    }
  };

  const trackCopyError = (section_id: string, error_message: string) => {
    try {
      const sessionId = sessionStorage.getItem(CURRENT_GENERATION_SESSION_KEY);

      posthog?.capture('discharge_copy_failed', {
        session_id: sessionId,
        section_id,
        error: error_message,
        timestamp: new Date().toISOString(),
      });
    } catch (trackingError) {
      console.error('Failed to track copy error:', trackingError);
    }
  };

  const setPersonProperties = (properties: Record<string, any>) => {
    try {
      posthog?.setPersonProperties(properties);
    } catch (error) {
      console.error('Failed to set person properties:', error);
    }
  };

  return {
    trackDischargeGenerationStarted,
    trackDischargeGenerationCompleted,
    trackContentCopy,
    trackCopyError,
    setPersonProperties,
  };
};
