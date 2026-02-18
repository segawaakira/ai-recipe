import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.use(
    '/api-docs{/*path}',
    basicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USER || 'admin']:
          process.env.SWAGGER_PASSWORD || 'password',
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Ai recipe API')
    .setDescription('Ai recipe API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
