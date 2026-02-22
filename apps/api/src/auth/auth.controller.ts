import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailVerificationService } from '../email/email-verification.service';
import { PasswordResetService } from '../email/password-reset.service';
import { Public } from './public.decorator';
import { CurrentUser } from './current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Email not verified' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.emailVerificationService.verifyEmail(dto.token);
    return { message: 'メールアドレスの確認が完了しました' };
  }

  @Public()
  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.emailVerificationService.resendVerification(dto.email);
    return { message: '確認メールを再送信しました' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid current password' })
  async changePassword(
    @CurrentUser() user: { userId: number; email: string },
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(
      user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
    return { message: 'パスワードを変更しました' };
  }

  @Public()
  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async requestPasswordReset(@Body() dto: ResendVerificationDto) {
    await this.passwordResetService.requestPasswordReset(dto.email);
    return { message: 'パスワードリセットメールを送信しました' };
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.passwordResetService.resetPassword(dto.token, dto.newPassword);
    return { message: 'パスワードをリセットしました' };
  }
}
