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
import { resolve } from 'path';
import { writeFileSync, createWriteStream, mkdirSync } from 'fs';
import { get } from 'http';

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

  // Generate swagger.json and fetch swagger UI assets in development mode
  if (process.env.NODE_ENV === 'development') {
    const swaggerStaticPath = resolve(process.cwd(), 'swagger-static');

    // Ensure swagger-static directory exists
    try {
      mkdirSync(swaggerStaticPath, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Write swagger.json file
    const swaggerJsonPath = resolve(swaggerStaticPath, 'swagger.json');
    writeFileSync(swaggerJsonPath, JSON.stringify(document, null, 2));
    logger.log(`Swagger JSON file written to: ${swaggerJsonPath}`);

    // Fetch swagger UI assets from production server
    const serverUrl = configService.get<string>(
      'PRODUCTION_SERVER_URL',
      'http://localhost:' + port,
    );
    const swaggerPath = `${serverUrl}/${apiPrefix}/docs`;

    // Helper function to fetch a file
    const fetchSwaggerAsset = (filename: string) => {
      const filePath = resolve(swaggerStaticPath, filename);
      get(`${swaggerPath}/${filename}`, (response) => {
        if (response.statusCode === 200) {
          response.pipe(createWriteStream(filePath));
          logger.log(`Swagger UI ${filename} file written to: ${filePath}`);
        } else {
          logger.warn(`Failed to fetch ${filename}: HTTP ${response.statusCode}`);
        }
      }).on('error', (err) => {
        logger.warn(`Failed to fetch ${filename}: ${err.message}`);
      });
    };

    // Wait a bit for the server to be fully ready (especially when using localhost)
    const delay = serverUrl.includes('localhost') ? 2000 : 500;
    setTimeout(() => {
      logger.log(`Fetching Swagger UI assets from: ${swaggerPath}`);

      // Fetch swagger-ui-bundle.js
      fetchSwaggerAsset('swagger-ui-bundle.js');
      fetchSwaggerAsset('swagger-ui-init.js');
      fetchSwaggerAsset('swagger-ui-standalone-preset.js');
      fetchSwaggerAsset('swagger-ui.css');
      fetchSwaggerAsset('index.html');
    }, delay);
  }
}

bootstrap();
