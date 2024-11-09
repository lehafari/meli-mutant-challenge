import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { AppConfigService } from './app/config/services/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const env = app.get(AppConfigService).env;
  const port = app.get(AppConfigService).port;
  const globalPrefix = app.get(AppConfigService).globalPrefix;

  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Swagger
  if (env === 'development') {
    const options = new DocumentBuilder()
      .setTitle('Mutant API')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('docs', app, document);

    Logger.log(
      `Swagger is running on: http://localhost:${port}/docs`,
      'Swagger'
    );
  }

  await app.listen(port);
}
bootstrap();
