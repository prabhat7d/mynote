import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import {
  NOTE_EMBEDDING_QUEUE,
  GENERATE_NOTE_EMBEDDING,
} from './embeddings.constants';
import { observeOpenAI } from '@langfuse/openai';

interface NoteEmbeddingJob {
  noteId: string;
  userId: string;
}

@Processor(NOTE_EMBEDDING_QUEUE)
@Injectable()
export class EmbeddingsProcessor extends WorkerHost {
  private readonly logger = new Logger(EmbeddingsProcessor.name);
  private readonly openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    super();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.openai = observeOpenAI(
      new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      }),
      {
        traceName: 'mynote-note-embedding',
        generationName: 'generate-note-embedding',
        tags: ['mynote', 'embeddings', 'bullmq'],
      },
    );
  }

  async process(job: Job<NoteEmbeddingJob>) {
    if (job.name !== GENERATE_NOTE_EMBEDDING) {
      throw new Error(`Unsupported job: ${job.name}`);
    }

    const { noteId, userId } = job.data;

    // Fetch the latest note belonging to this user.
    const note = await this.prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
      },
    });

    if (!note) {
      this.logger.warn(`Note ${noteId} not found. Skipping embedding.`);
      return;
    }

    // Generate embedding using OpenAI.
    const response = await this.openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      input: `${note.title}\n\n${note.content}`,
    });

    const embedding = response.data[0].embedding;

    // Convert the vector into pgvector's string representation.
    const vectorString = `[${embedding.join(',')}]`;

    // Insert or update the note embedding.
    await this.prisma.$executeRaw`
      INSERT INTO "NoteEmbedding"
        ("id", "noteId", "embedding", "createdAt", "updatedAt")
      VALUES
        (gen_random_uuid(), ${note.id}::uuid, ${vectorString}::vector, NOW(), NOW())
      ON CONFLICT ("noteId")
      DO UPDATE SET
        "embedding" = EXCLUDED."embedding",
        "updatedAt" = NOW()
    `;

    this.logger.log(
      `Embedding saved for note ${noteId}. Dimensions: ${embedding.length}`,
    );

    return {
      noteId,
      dimensions: embedding.length,
    };
  }
}