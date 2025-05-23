import { z } from 'zod';

export const fileSchema = z.object({
  id: z.number(),
  fileName: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),
  source: z.string(),
});

export type memoryFile = z.infer<typeof fileSchema>;
