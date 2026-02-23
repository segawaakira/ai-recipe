import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class FollowUpRecipeDto {
  @ApiProperty({ example: '## 材料（2人分）\n...' })
  @IsString()
  @IsNotEmpty()
  recipeContent: string;

  @ApiProperty({ example: 'トマトパスタ' })
  @IsString()
  @IsNotEmpty()
  recipeName: string;

  @ApiProperty({ example: '減塩バージョンにしてください' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
