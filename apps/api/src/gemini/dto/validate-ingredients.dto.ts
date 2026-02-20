import { ApiProperty } from '@nestjs/swagger';

export class ValidateIngredientsDto {
  @ApiProperty({ type: [String] })
  newIngredients: string[];

  @ApiProperty({ type: [String] })
  existingIngredients: string[];
}
