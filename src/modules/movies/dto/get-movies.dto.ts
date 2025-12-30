import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMoviesDto {
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
    description: 'Sort order',
    example: 'popularity.desc',
    required: false,
    enum: [
      'popularity.asc',
      'popularity.desc',
      'release_date.asc',
      'release_date.desc',
      'vote_average.asc',
      'vote_average.desc',
      'vote_count.asc',
      'vote_count.desc',
    ],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Comma-separated genre IDs',
    example: '28,12',
    required: false,
  })
  @IsOptional()
  @IsString()
  withGenres?: string;

  @ApiProperty({
    description: 'Release year',
    example: 2020,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year?: number;

  @ApiProperty({
    description: 'Minimum vote average',
    example: 7.0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  voteAverageGte?: number;
}

