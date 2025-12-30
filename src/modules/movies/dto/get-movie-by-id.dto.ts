import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class GetMovieByIdDto {
  @ApiProperty({
    description: 'Movie ID (IMDb ID format: tt1234567 or numeric ID)',
    example: 'tt3896198',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(tt\d{7,8}|\d+)$/, {
    message: 'ID must be in IMDb format (tt1234567) or numeric',
  })
  id: string;
}

