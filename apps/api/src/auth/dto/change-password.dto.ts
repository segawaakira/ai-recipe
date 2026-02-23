import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword1' })
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newPassword1' })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
