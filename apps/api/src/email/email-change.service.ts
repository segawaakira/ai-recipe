import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class EmailChangeService {
  private readonly logger = new Logger(EmailChangeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async requestEmailChange(userId: number, newEmail: string): Promise<void> {
    // 新しいメールアドレスが既に使われていないか確認
    const existing = await this.prisma.prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existing) {
      throw new BadRequestException(
        'このメールアドレスは既に使用されています',
      );
    }

    // 既存トークンを削除
    await this.prisma.prisma.emailChangeToken.deleteMany({
      where: { userId },
    });

    // 新しいトークンを生成（1時間有効）
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.prisma.emailChangeToken.create({
      data: { token, newEmail, expiresAt, userId },
    });

    await this.emailService.sendEmailChangeEmail(newEmail, token);
    this.logger.log(
      `Email change token created for user ${userId} to ${newEmail}`,
    );
  }

  async verifyEmailChange(token: string): Promise<void> {
    const record = await this.prisma.prisma.emailChangeToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) {
      throw new BadRequestException('無効なトークンです');
    }

    if (record.expiresAt < new Date()) {
      await this.prisma.prisma.emailChangeToken.delete({
        where: { id: record.id },
      });
      throw new BadRequestException('トークンの有効期限が切れています');
    }

    // 新しいメールアドレスが他のユーザーに使われていないか再確認
    const existing = await this.prisma.prisma.user.findUnique({
      where: { email: record.newEmail },
    });

    if (existing) {
      await this.prisma.prisma.emailChangeToken.deleteMany({
        where: { userId: record.userId },
      });
      throw new BadRequestException(
        'このメールアドレスは既に使用されています',
      );
    }

    // メールアドレスを更新
    await this.prisma.prisma.user.update({
      where: { id: record.userId },
      data: { email: record.newEmail },
    });

    // 使用済みトークンを削除
    await this.prisma.prisma.emailChangeToken.deleteMany({
      where: { userId: record.userId },
    });

    this.logger.log(
      `Email changed for user ${record.userId} to ${record.newEmail}`,
    );
  }
}
