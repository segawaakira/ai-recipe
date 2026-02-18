import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipeDto {
  @ApiProperty({ example: 'トマトパスタ' })
  name: string;

  @ApiProperty({ example: '## トマトパスタの作り方\n...' })
  content: string;

  @ApiProperty({ example: ['トマト', '玉ねぎ', 'にんにく'], type: [String] })
  ingredients: string[];

  @ApiProperty({ example: 2 })
  servings: number;

  @ApiProperty({ example: '和食', required: false, nullable: true })
  genre?: string;

  @ApiProperty({ example: [{ videoId: 'abc', title: 'Recipe video', channelTitle: 'Channel', thumbnail: 'https://...' }], required: false, nullable: true })
  youtubeVideos?: unknown;
}
