import { ApiProperty } from '@nestjs/swagger';

export class CreateIngredientDto {
  @ApiProperty({ example: ['tomato', 'onion', 'garlic'], type: [String] })
  ingredients: string[];
}
