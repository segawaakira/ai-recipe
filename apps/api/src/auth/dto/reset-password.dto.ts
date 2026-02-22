import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123def456...' })
  token: string;

  @ApiProperty({ example: 'newPassword1' })
  newPassword: string;
}
