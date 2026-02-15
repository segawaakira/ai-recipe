import { ApiProperty } from '@nestjs/swagger';
import { RecipeResponseDto } from './recipe-response.dto';

export class PaginatedRecipeResponseDto {
  @ApiProperty({ type: [RecipeResponseDto] })
  items: RecipeResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
