import { ApiProperty } from '@nestjs/swagger';

export class ValidateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password1' })
  password: string;
}
