import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateRecipeContentDto {
  @ApiProperty({ example: '減塩トマトパスタ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '## 材料（2人分）\n...' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
