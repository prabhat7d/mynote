import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(50000),
});

export type CreateNoteDto = z.infer<typeof createNoteSchema>;