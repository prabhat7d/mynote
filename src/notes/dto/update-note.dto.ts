import { createNoteSchema } from './create-note.dto';

export const updateNoteSchema = createNoteSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateNoteDto = typeof updateNoteSchema extends {
  _output: infer T;
}
  ? T
  : never;