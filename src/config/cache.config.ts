import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheOptionsFactory, CacheModuleOptions } from '@nestjs/cache-manager';
import { memoryStore } from 'cache-manager';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  createCacheOptions(): CacheModuleOptions {
    const ttl = this.configService.get<number>('CACHE_TTL', 300) * 1000; // Convert to milliseconds

    return {
      store: memoryStore(),
      ttl,
      max: 1000, // Maximum number of items in cache
    };
  }
}

