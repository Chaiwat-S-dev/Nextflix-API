import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
// import compression from 'compression';
import { AppModule } from './app.module';
import { Logger } from './common/logging/logger.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  const port = configService.get<number>('PORT', 3000);

  // Security
  app.use(helmet());

  // Compression
  // app.use(compression());

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Nextflix API')
    .setDescription('A production-ready NestJS backend service for movie data')
    .setVersion('1.0')
    .addTag('movies', 'Movie-related endpoints')
    .addTag('health', 'Health check endpoints')
    .build();

  const CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css'; // Use a recent version
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document, {
    useGlobalPrefix: true,
    // swaggerOptions: {
    //   persistAuthorization: true,
    // },
    customCssUrl: CSS_URL,
  });

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
