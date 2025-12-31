import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import helmet from 'helmet';
import express, { Express } from 'express';
// import compression from 'compression';
import { AppModule } from './app.module';
import { Logger } from './common/logging/logger.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { INestApplication } from '@nestjs/common';

const server: Express = express();

async function setupApp(app: INestApplication, isServerless: boolean) {
  const configService = app.get(ConfigService);
  const logger = app.get(Logger);
  const apiPrefix = configService.get('API_PREFIX', 'api') as string;
  const port = configService.get('PORT', 3000) as number;

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
  const productionServerUrl = (configService.get(
    'PRODUCTION_SERVER_URL',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${port}`,
  ) || '') as string;

  const config = new DocumentBuilder()
    .setTitle('Nextflix API')
    .setDescription('A production-ready NestJS backend service for movie data')
    .setVersion('1.0')
    .addTag('movies', 'Movie-related endpoints')
    .addTag('health', 'Health check endpoints')
    .addServer(productionServerUrl)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Use CDN for Swagger UI in serverless mode
  const swaggerOptions = isServerless
    ? {
        useGlobalPrefix: true,
        jsonDocumentUrl: 'swagger.json',
        customSiteTitle: 'Nextflix API Docs',
        customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        customJs: [
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
        ],
      }
    : {
        useGlobalPrefix: true,
        jsonDocumentUrl: 'swagger.json',
        customSiteTitle: 'Nextflix API Docs',
      };

  SwaggerModule.setup('docs', app, document, swaggerOptions);
}

// Vercel Entry Point (Serverless)
export const createVercelHandler = async (expressInstance: Express) => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));
  await setupApp(app, true);
  await app.init();
  return app;
};

if (process.env.VERCEL) {
  createVercelHandler(server);
} else {
  // Local / Docker Entry Point (Standard)
  async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });
    await setupApp(app, false);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    const logger = app.get(Logger);
    const apiPrefix = app.get(ConfigService).get('API_PREFIX', 'api') as string;
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
  }
  bootstrap();
}

export default server;
