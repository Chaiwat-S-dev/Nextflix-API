import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { readFileSync } from 'fs';

@Controller()
export class PortalController {
  constructor(private readonly configService: ConfigService) {}

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

