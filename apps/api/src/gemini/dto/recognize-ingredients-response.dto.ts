import { ApiProperty } from '@nestjs/swagger';

export class RecognizeIngredientsResponseDto {
  @ApiProperty({ example: ['トマト', '玉ねぎ', '鶏もも肉'], type: [String] })
  ingredients: string[];
}
