import { ApiProperty } from '@nestjs/swagger';

export class CreateIngredientDto {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: ['tomato', 'onion', 'garlic'], type: [String] })
  ingredients: string[];
}
