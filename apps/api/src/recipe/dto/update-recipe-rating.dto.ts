import { ApiProperty } from '@nestjs/swagger';

export class UpdateRecipeRatingDto {
  @ApiProperty({ example: 4, description: '1-5の5段階評価' })
  rating: number;
}
