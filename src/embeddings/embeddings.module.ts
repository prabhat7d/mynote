import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmbeddingsService } from './embeddings.service';
import { EmbeddingsProcessor } from './embeddings.processor';
import { NOTE_EMBEDDING_QUEUE } from './embeddings.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: NOTE_EMBEDDING_QUEUE,
    }),
  ],
  providers: [EmbeddingsService, EmbeddingsProcessor],
  exports: [EmbeddingsService],
})
export class EmbeddingsModule {}