import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class UpdateRecipeRatingDto {
  @ApiProperty({ example: 4, description: '1-5の5段階評価' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}
