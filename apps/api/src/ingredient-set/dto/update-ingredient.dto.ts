import { ApiProperty } from '@nestjs/swagger';

export class UpdateIngredientDto {
  @ApiProperty({ example: ['tomato', 'onion', 'garlic'], type: [String] })
  ingredients: string[];
}
