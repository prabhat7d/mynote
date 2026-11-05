import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  NOTE_EMBEDDING_QUEUE,
  GENERATE_NOTE_EMBEDDING,
} from './embeddings.constants';

interface NoteEmbeddingJob {
  noteId: string;
  userId: string;
}

@Injectable()
export class EmbeddingsService {
  constructor(
    @InjectQueue(NOTE_EMBEDDING_QUEUE)
    private readonly embeddingQueue: Queue,
  ) {}

  async addEmbeddingJob(data: NoteEmbeddingJob) {
    return this.embeddingQueue.add(GENERATE_NOTE_EMBEDDING, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    });
  }
}