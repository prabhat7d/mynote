import { Module } from '@nestjs/common';

import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { EmbeddingsModule } from '../embeddings/embeddings.module';

@Module({
  imports: [EmbeddingsModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}