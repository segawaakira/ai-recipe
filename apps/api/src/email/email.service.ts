import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromEmail: string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      family: 4,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    } as SMTPTransport.Options);
    this.fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject: 'メールアドレスの確認 - AI Recipe',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ea580c;">AI Recipe</h2>
            <p>アカウント登録ありがとうございます。</p>
            <p>以下のボタンをクリックしてメールアドレスを確認してください。</p>
            <a href="${verifyUrl}" style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              メールアドレスを確認
            </a>
            <p style="color: #6b7280; font-size: 14px;">このリンクは24時間有効です。</p>
            <p style="color: #6b7280; font-size: 14px;">このメールに心当たりがない場合は無視してください。</p>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}:`, error);
      throw error;
    }
  }

  async sendEmailChangeEmail(to: string, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/auth/verify-email-change?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject: 'メールアドレス変更の確認 - AI Recipe',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ea580c;">AI Recipe</h2>
            <p>メールアドレス変更のリクエストを受け付けました。</p>
            <p>以下のボタンをクリックして新しいメールアドレスを確認してください。</p>
            <a href="${verifyUrl}" style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              メールアドレスを確認
            </a>
            <p style="color: #6b7280; font-size: 14px;">このリンクは1時間有効です。</p>
            <p style="color: #6b7280; font-size: 14px;">このメールに心当たりがない場合は無視してください。</p>
          </div>
        `,
      });
      this.logger.log(`Email change verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email change verification email to ${to}:`,
        error,
      );
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject: 'パスワードリセット - AI Recipe',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ea580c;">AI Recipe</h2>
            <p>パスワードリセットのリクエストを受け付けました。</p>
            <p>以下のボタンをクリックして新しいパスワードを設定してください。</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              パスワードをリセット
            </a>
            <p style="color: #6b7280; font-size: 14px;">このリンクは1時間有効です。</p>
            <p style="color: #6b7280; font-size: 14px;">このメールに心当たりがない場合は無視してください。</p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}:`, error);
      throw error;
    }
  }
}
