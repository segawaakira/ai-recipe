import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.emailVerified) {
      throw new ForbiddenException('EMAIL_NOT_VERIFIED');
    }
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('ユーザーが見つかりません');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('現在のパスワードが正しくありません');
    }

    await this.usersService.updatePassword(userId, newPassword);
  }
}
