import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateIngredientDto {
  @ApiProperty({ example: ['tomato', 'onion', 'garlic'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  ingredients: string[];
}
