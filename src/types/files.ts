import { z } from 'zod';

export const fileSchema = z.object({
  id: z.number(),
  fileName: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),
  source: z.string(),
  documentId: z.string().optional(), // Real document ID for operations
});

export type memoryFile = z.infer<typeof fileSchema>;
