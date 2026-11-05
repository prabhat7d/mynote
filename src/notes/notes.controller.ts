import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotesService } from './notes.service';
import { createNoteSchema } from './dto/create-note.dto';
import { updateNoteSchema } from './dto/update-note.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    const dto = createNoteSchema.parse(body);

    return this.notesService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.notesService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.notesService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const dto = updateNoteSchema.parse(body);

    return this.notesService.update(
      req.user.userId,
      id,
      dto,
    );
  }

  @Delete(':id')
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.notesService.remove(req.user.userId, id);
  }
}