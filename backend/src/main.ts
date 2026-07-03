import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';

const UPLOADS_DIR = join(__dirname, '..', '..', 'uploads');
mkdirSync(UPLOADS_DIR, { recursive: true });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

  app.enableCors({ origin: allowedOrigins, credentials: true });

  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`Servidor corriendo en puerto ${port}`);
}
bootstrap();
