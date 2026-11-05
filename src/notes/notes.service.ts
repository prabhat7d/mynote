import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmbeddingsService } from '../embeddings/embeddings.service';

import { PrismaService } from '../prisma/prisma.service';
import type { CreateNoteDto } from './dto/create-note.dto';
import type { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService, private readonly embeddingsService: EmbeddingsService) {}

  async create(userId: string, dto: CreateNoteDto) {
  const note = await this.prisma.note.create({
    data: {
      title: dto.title,
      content: dto.content,
      userId,
    },
  });

  await this.embeddingsService.addEmbeddingJob({
    noteId: note.id,
    userId,
  });

  return note;
}

  async findAll(userId: string) {
    return this.prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(
  userId: string,
  noteId: string,
  dto: UpdateNoteDto,
) {
  const result = await this.prisma.note.updateMany({
    where: {
      id: noteId,
      userId,
    },
    data: dto,
  });

  if (result.count === 0) {
    throw new NotFoundException('Note not found');
  }

  const note = await this.findOne(userId, noteId);

  await this.embeddingsService.addEmbeddingJob({
    noteId: note.id,
    userId,
  });

  return note;
}

  async remove(userId: string, noteId: string) {
    const result = await this.prisma.note.deleteMany({
      where: {
        id: noteId,
        userId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Note not found');
    }

    return {
      message: 'Note deleted successfully',
    };
  }
}