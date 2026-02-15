import { ApiProperty } from '@nestjs/swagger';

export class IngredientSetResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: ['tomato', 'onion', 'garlic'], type: [String] })
  ingredients: string[];

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 1 })
  userId: number;
}
