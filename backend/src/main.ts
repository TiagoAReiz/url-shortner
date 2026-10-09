import 'temporal-polyfill/global';
import { hostname } from 'node:os';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Atrás do nginx: lê o IP real do X-Forwarded-For (1 = um proxy confiável).
  app.set('trust proxy', 1);
  app.use(cookieParser());
  // SPA em outra origem: libera CORS com cookies (credentials).
  app.enableCors({
    origin: (process.env['CORS_ORIGIN'] ?? 'http://localhost:5173').split(','),
    credentials: true,
  });
  // Mostra qual réplica atendeu (útil para ver o balanceamento).
  app.use((_req: unknown, res: { setHeader(k: string, v: string): void }, next: () => void) => {
    res.setHeader('X-Served-By', hostname());
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
