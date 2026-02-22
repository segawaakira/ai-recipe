import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createAndSendVerification(
    userId: number,
    email: string,
  ): Promise<void> {
    // 既存トークンを削除
    await this.prisma.prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    // 新しいトークンを生成（24時間有効）
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.prisma.emailVerificationToken.create({
      data: { token, expiresAt, userId },
    });

    await this.emailService.sendVerificationEmail(email, token);
    this.logger.log(`Verification token created for user ${userId}`);
  }

  async verifyEmail(token: string): Promise<void> {
    const record =
      await this.prisma.prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

    if (!record) {
      throw new BadRequestException('無効な認証トークンです');
    }

    if (record.expiresAt < new Date()) {
      // 期限切れトークンを削除
      await this.prisma.prisma.emailVerificationToken.delete({
        where: { id: record.id },
      });
      throw new BadRequestException('認証トークンの有効期限が切れています');
    }

    // メール認証を完了
    await this.prisma.prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });

    // 使用済みトークンを削除
    await this.prisma.prisma.emailVerificationToken.deleteMany({
      where: { userId: record.userId },
    });

    this.logger.log(`Email verified for user ${record.userId}`);
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.prisma.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // セキュリティ上、ユーザーが存在しなくても成功レスポンスを返す
      this.logger.warn(
        `Resend verification requested for non-existent email: ${email}`,
      );
      return;
    }

    if (user.emailVerified) {
      this.logger.warn(
        `Resend verification requested for already verified user: ${email}`,
      );
      return;
    }

    await this.createAndSendVerification(user.id, user.email);
  }
}
