import { ApiProperty } from '@nestjs/swagger';

export class ValidateIngredientResultDto {
  @ApiProperty({ example: 'トマト' })
  name: string;

  @ApiProperty({ example: true })
  isFood: boolean;

  @ApiProperty({ example: null, nullable: true })
  similarTo: string | null;
}

export class ValidateIngredientsResponseDto {
  @ApiProperty({ type: [ValidateIngredientResultDto] })
  results: ValidateIngredientResultDto[];
}
