import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ValidateIngredientsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  newIngredients: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  existingIngredients: string[];
}
