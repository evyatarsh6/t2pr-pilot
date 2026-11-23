import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Every public route lives under /api; /health stays at the root for probes.
  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log('gateway listening on port ' + port);
}

void bootstrap();
