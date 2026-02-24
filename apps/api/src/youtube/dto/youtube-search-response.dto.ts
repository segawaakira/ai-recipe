import { ApiProperty } from '@nestjs/swagger';

export class YouTubeVideoDto {
  @ApiProperty({ example: 'dQw4w9WgXcQ' })
  videoId: string;

  @ApiProperty({ example: 'トマトパスタの作り方' })
  title: string;

  @ApiProperty({ example: '料理チャンネル' })
  channelTitle: string;

  @ApiProperty({ example: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' })
  thumbnail: string;
}

export class YouTubeSearchResponseDto {
  @ApiProperty({ type: [YouTubeVideoDto] })
  videos: YouTubeVideoDto[];
}
