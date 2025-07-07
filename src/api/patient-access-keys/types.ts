import { z } from 'zod';

// Database types
export type PatientAccessKey = {
  id: string;
  summary_id: string;
  role: 'patient' | 'caregiver';
  phone_number: string;
  access_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Zod schemas for validation
export const AccessKeyRoleSchema = z.enum(['patient', 'caregiver']);

export const PhoneNumberSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number format');

export const CreateAccessKeySchema = z.object({
  summary_id: z.string().uuid('Invalid summary ID'),
  phone_number: PhoneNumberSchema,
  role: AccessKeyRoleSchema,
});

export const SendSMSSchema = z.object({
  summary_id: z.string().uuid('Invalid summary ID'),
  phone_number: PhoneNumberSchema,
  role: AccessKeyRoleSchema,
  patient_name: z.string().min(1, 'Patient name is required'),
});

export const DeactivateAccessKeySchema = z.object({
  access_key_id: z.string().uuid('Invalid access key ID'),
});

// API response types
export type CreateAccessKeyResponse = {
  success: boolean;
  access_key?: PatientAccessKey;
  access_url?: string;
  was_existing?: boolean;
  error?: string;
};

export type SendSMSResponse = {
  success: boolean;
  message_id?: string;
  access_url?: string;
  error?: string;
};

export type ListAccessKeysResponse = {
  success: boolean;
  access_keys?: PatientAccessKey[];
  error?: string;
};

export type DeactivateAccessKeyResponse = {
  success: boolean;
  error?: string;
};

// Request types
export type CreateAccessKeyRequest = z.infer<typeof CreateAccessKeySchema>;
export type SendSMSRequest = z.infer<typeof SendSMSSchema>;
export type DeactivateAccessKeyRequest = z.infer<typeof DeactivateAccessKeySchema>;

export type AccessKeyRole = z.infer<typeof AccessKeyRoleSchema>;
