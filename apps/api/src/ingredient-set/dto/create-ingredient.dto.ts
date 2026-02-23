import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({ example: ['tomato', 'onion', 'garlic'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  ingredients: string[];
}
