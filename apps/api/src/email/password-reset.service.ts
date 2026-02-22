import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // セキュリティ上、ユーザーが存在しなくても成功レスポンスを返す
      this.logger.warn(
        `Password reset requested for non-existent email: ${email}`,
      );
      return;
    }

    // 既存トークンを削除
    await this.prisma.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // 新しいトークンを生成（1時間有効）
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.prisma.passwordResetToken.create({
      data: { token, expiresAt, userId: user.id },
    });

    await this.emailService.sendPasswordResetEmail(email, token);
    this.logger.log(`Password reset token created for user ${user.id}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await this.prisma.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) {
      throw new BadRequestException('無効なリセットトークンです');
    }

    if (record.expiresAt < new Date()) {
      await this.prisma.prisma.passwordResetToken.delete({
        where: { id: record.id },
      });
      throw new BadRequestException('リセットトークンの有効期限が切れています');
    }

    // パスワードを更新
    await this.usersService.updatePassword(record.userId, newPassword);

    // 使用済みトークンを削除
    await this.prisma.prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId },
    });

    this.logger.log(`Password reset completed for user ${record.userId}`);
  }
}
