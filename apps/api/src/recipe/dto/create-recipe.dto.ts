import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { YouTubeVideoDto } from '../../youtube/dto/youtube-search-response.dto';

export class CreateRecipeDto {
  @ApiProperty({ example: 'トマトパスタ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '## トマトパスタの作り方\n...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: ['トマト', '玉ねぎ', 'にんにく'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  ingredients: string[];

  @ApiProperty({ example: 2 })
  @IsNumber()
  servings: number;

  @ApiProperty({ example: '和食', required: false, nullable: true })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiProperty({ type: [YouTubeVideoDto], required: false, nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => YouTubeVideoDto)
  youtubeVideos?: YouTubeVideoDto[];
}
