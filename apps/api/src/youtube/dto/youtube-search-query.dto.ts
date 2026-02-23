import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class YouTubeSearchQueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  q: string;
}
