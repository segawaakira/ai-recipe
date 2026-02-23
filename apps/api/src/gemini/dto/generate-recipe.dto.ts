import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RatedRecipeDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  rating: number;
}

export class GenerateRecipeDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  preferredIngredients: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  allIngredients: string[];

  @ApiProperty()
  @IsNumber()
  @Min(1)
  servings: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ type: [RatedRecipeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatedRecipeDto)
  ratedRecipes?: RatedRecipeDto[];
}
