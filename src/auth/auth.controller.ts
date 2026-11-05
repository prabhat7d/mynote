import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { registerSchema } from './dto/register.dto';
import { loginSchema } from './dto/login.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: unknown) {
    const dto = registerSchema.parse(body);
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() body: unknown) {
    const dto = loginSchema.parse(body);
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
    }
}