import { ApiProperty } from '@nestjs/swagger';

export class FollowUpRecipeResponseDto {
  @ApiProperty({ example: '## 材料（2人分）\n...' })
  recipe: string;

  @ApiProperty({ example: '減塩トマトパスタ' })
  recipeName: string;
}
