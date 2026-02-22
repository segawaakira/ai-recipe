import { Global, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { EmailService } from './email.service';
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetService } from './password-reset.service';
import { EmailChangeService } from './email-change.service';

@Global()
@Module({
  imports: [UsersModule],
  providers: [
    EmailService,
    EmailVerificationService,
    PasswordResetService,
    EmailChangeService,
  ],
  exports: [
    EmailService,
    EmailVerificationService,
    PasswordResetService,
    EmailChangeService,
  ],
})
export class EmailModule {}
