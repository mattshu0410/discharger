import { z } from 'zod';

export const fileSchema = z.object({
  id: z.number(),
  fileName: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),
  source: z.string(),
  shareStatus: z.enum(['private', 'public']).optional(),
  documentId: z.string().optional(), // Real document ID for operations
  fileUrl: z.string().optional(), // Supabase Storage URL
  uploadedAt: z.string().optional(), // Upload timestamp
});

export type memoryFile = z.infer<typeof fileSchema>;
