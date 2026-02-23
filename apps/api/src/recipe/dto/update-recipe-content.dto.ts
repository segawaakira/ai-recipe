import { ApiProperty } from '@nestjs/swagger';

export class UpdateRecipeContentDto {
  @ApiProperty({ example: '減塩トマトパスタ' })
  name: string;

  @ApiProperty({ example: '## 材料（2人分）\n...' })
  content: string;
}
