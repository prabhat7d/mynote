import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { BullModule } from '@nestjs/bullmq';    
import { SearchModule } from './search/search.module';
import { MetricsModule } from './metrics/metrics.module';


@Module({
  imports: [BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
      },
    }),PrismaModule, AuthModule, NotesModule, EmbeddingsModule, SearchModule, MetricsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}