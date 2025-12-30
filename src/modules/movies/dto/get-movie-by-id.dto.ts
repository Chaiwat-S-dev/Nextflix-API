import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMovieByIdDto {
  @ApiProperty({
    description: 'Movie ID (numeric)',
    example: 603,
    required: true,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

