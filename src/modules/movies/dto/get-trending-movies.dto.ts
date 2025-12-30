import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTrendingMoviesDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    default: 1,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Time window for trending',
    example: 'day',
    default: 'day',
    required: false,
    enum: ['day', 'week'],
  })
  @IsOptional()
  @IsEnum(['day', 'week'])
  timeWindow?: 'day' | 'week' = 'day';
}

