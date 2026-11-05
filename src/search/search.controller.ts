import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(AuthGuard('jwt'))
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async search(
    @Req() req: any,
    @Body('query') query: string,
  ) {
    const userId =
      req.user?.userId ??
      req.user?.sub ??
      req.user?.id;

    if (!userId) {
      throw new Error('Authenticated user ID not found');
    }

    return this.searchService.search(userId, query);
  }
}