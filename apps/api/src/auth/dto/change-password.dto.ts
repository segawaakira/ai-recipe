import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword1' })
  currentPassword: string;

  @ApiProperty({ example: 'newPassword1' })
  newPassword: string;
}
