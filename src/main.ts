import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import './instrumentation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.PORT) || 3001;

  await app.listen(port);
  console.log(`MyNote is running at http://localhost:${port}`);
}

bootstrap();