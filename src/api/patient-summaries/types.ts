import type { Block } from '@/types/blocks';

export type PatientSummary = {
  id: string;
  patient_id: string;
  doctor_id: string;
  patient_user_id?: string;
  blocks: Block[];
  discharge_text?: string;
  status: 'draft' | 'published' | 'archived';
  preferred_locale: string;
  created_at: string;
  updated_at: string;
  patients?: {
    id: string;
    name: string;
    age: number;
    sex: string;
  };
};

export type CreatePatientSummaryInput = {
  patient_id: string;
  blocks: Block[];
  discharge_text?: string;
  status?: 'draft' | 'published' | 'archived';
  preferred_locale?: string;
};

export type UpdatePatientSummaryInput = {
  blocks?: Block[];
  discharge_text?: string;
  status?: 'draft' | 'published' | 'archived';
  patient_user_id?: string;
  preferred_locale?: string;
};

export type ListPatientSummariesParams = {
  patientId?: string;
  status?: 'draft' | 'published' | 'archived';
  limit?: number;
  offset?: number;
};

export type ListPatientSummariesResponse = {
  summaries: PatientSummary[];
};

export type PatientSummaryResponse = {
  summary: PatientSummary;
};

export type SummaryTranslation = {
  id: string;
  patient_summary_id: string;
  locale: string;
  translated_blocks: Block[];
  created_at: string;
  updated_at: string;
};

export type CreateTranslationInput = {
  patient_summary_id: string;
  locale: string;
  translated_blocks: Block[];
};

export type TranslationResponse = {
  translation: SummaryTranslation;
};

export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar';

export type TranslateRequest = {
  patient_summary_id: string;
  target_locale: SupportedLocale;
  access_key?: string; // Optional access key for public access
};
