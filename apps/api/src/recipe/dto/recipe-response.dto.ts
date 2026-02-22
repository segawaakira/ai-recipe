import { ApiProperty } from '@nestjs/swagger';
import { YouTubeVideoDto } from '../../youtube/dto/youtube-search-response.dto';

export class RecipeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'トマトパスタ' })
  name: string;

  @ApiProperty({ example: '## トマトパスタの作り方\n...' })
  content: string;

  @ApiProperty({ example: ['トマト', '玉ねぎ', 'にんにく'], type: [String] })
  ingredients: string[];

  @ApiProperty({ example: 2 })
  servings: number;

  @ApiProperty({ example: '和食', required: false, nullable: true })
  genre: string | null;

  @ApiProperty({ type: [YouTubeVideoDto], required: false, nullable: true })
  youtubeVideos: YouTubeVideoDto[] | null;

  @ApiProperty({ example: null, required: false, nullable: true, description: '1-5の5段階評価、未評価はnull' })
  rating: number | null;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 1 })
  userId: number;
}

export class RatedRecipeResponseDto {
  @ApiProperty({ example: 'トマトパスタ' })
  name: string;

  @ApiProperty({ example: 4, nullable: true })
  rating: number | null;
}
