import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class YouTubeVideoDto {
  @ApiProperty({ example: 'dQw4w9WgXcQ' })
  @IsString()
  videoId: string;

  @ApiProperty({ example: 'トマトパスタの作り方' })
  @IsString()
  title: string;

  @ApiProperty({ example: '料理チャンネル' })
  @IsString()
  channelTitle: string;

  @ApiProperty({ example: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' })
  @IsString()
  thumbnail: string;
}

export class YouTubeSearchResponseDto {
  @ApiProperty({ type: [YouTubeVideoDto] })
  videos: YouTubeVideoDto[];
}
