import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RatedRecipeDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  rating: number;
}

export class GenerateRecipeDto {
  @ApiPropertyOptional({ type: [String] })
  preferredIngredients?: string[];

  @ApiPropertyOptional({ type: [String] })
  allIngredients?: string[];

  @ApiPropertyOptional({ type: [String] })
  ingredients?: string[];

  @ApiPropertyOptional()
  servings?: number;

  @ApiPropertyOptional()
  genre?: string;

  @ApiPropertyOptional({ type: [RatedRecipeDto] })
  ratedRecipes?: RatedRecipeDto[];
}
