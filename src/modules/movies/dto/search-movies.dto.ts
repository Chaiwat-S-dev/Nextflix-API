import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchMoviesDto {
  @ApiProperty({
    description: 'Search query string',
    example: 'The Matrix',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  query: string;

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
}
