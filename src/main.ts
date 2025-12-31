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

  // CORS configuration (must be before helmet)
  app.enableCors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-Request-ID',
    ],
    exposedHeaders: ['Content-Length', 'Content-Type', 'X-Request-ID'],
    // credentials: true, // Cannot use with origin: '*'
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
  });

  // Security - Configure helmet to work with CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://petstore.swagger.io'],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://petstore.swagger.io'],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // Compression
  // app.use(compression());

  // Global prefix (exclude root path for portal)
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/'],
  });

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
  const productionServerUrl = configService.get<string>(
    'PRODUCTION_SERVER_URL',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${port}`,
  );
  const config = new DocumentBuilder()
    .setTitle('Nextflix API')
    .setDescription('A production-ready NestJS backend service for movie data')
    .setVersion('1.0')
    .addTag('movies', 'Movie-related endpoints')
    .addTag('health', 'Health check endpoints')
    .addServer(productionServerUrl)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    jsonDocumentUrl: 'swagger.json',
    customSiteTitle: 'Nextflix API Docs',
  });
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
