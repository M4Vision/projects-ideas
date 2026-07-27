import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  const seedService = app.get(SeedService);
  await seedService.seed();

  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap();
