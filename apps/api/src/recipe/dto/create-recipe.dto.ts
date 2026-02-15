import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipeDto {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'トマトパスタ' })
  name: string;

  @ApiProperty({ example: '## トマトパスタの作り方\n...' })
  content: string;

  @ApiProperty({ example: ['トマト', '玉ねぎ', 'にんにく'], type: [String] })
  ingredients: string[];

  @ApiProperty({ example: 2 })
  servings: number;

  @ApiProperty({ example: [{ videoId: 'abc', title: 'Recipe video', channelTitle: 'Channel', thumbnail: 'https://...' }], required: false, nullable: true })
  youtubeVideos?: unknown;
}
