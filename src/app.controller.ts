import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { readFileSync } from 'fs';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  portal(@Res() res: Response) {
    const htmlPath = join(process.cwd(), 'public', 'index.html');
    try {
      let html = readFileSync(htmlPath, 'utf-8');

      // Get swagger URL dynamically
      const productionServerUrl = this.configService.get<string>(
        'PRODUCTION_SERVER_URL',
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'https://nextflix-api-lake.vercel.app',
      );
      const apiPrefix = this.configService.get<string>('API_PREFIX', 'api');
      const swaggerUrl = `${productionServerUrl}/${apiPrefix}/swagger.json`;

      // Replace the swagger URL in HTML
      html = html.replace(
        'value="https://nextflix-api-lake.vercel.app/api/swagger.json"',
        `value="${swaggerUrl}"`,
      );

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      res.status(404).send('Portal page not found');
    }
  }
}
