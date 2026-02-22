import { Global, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { EmailService } from './email.service';
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetService } from './password-reset.service';

@Global()
@Module({
  imports: [UsersModule],
  providers: [EmailService, EmailVerificationService, PasswordResetService],
  exports: [EmailService, EmailVerificationService, PasswordResetService],
})
export class EmailModule {}
