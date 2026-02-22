import { ApiProperty } from '@nestjs/swagger';

export class GenerateRecipeResponseDto {
  @ApiProperty({ example: '## 材料（2人分）\n...' })
  recipe: string;

  @ApiProperty({ example: 'トマトパスタ' })
  recipeName: string;
}
