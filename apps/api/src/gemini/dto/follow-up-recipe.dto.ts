import { ApiProperty } from '@nestjs/swagger';

export class FollowUpRecipeDto {
  @ApiProperty({ example: '## 材料（2人分）\n...' })
  recipeContent: string;

  @ApiProperty({ example: 'トマトパスタ' })
  recipeName: string;

  @ApiProperty({ example: '減塩バージョンにしてください' })
  message: string;
}
