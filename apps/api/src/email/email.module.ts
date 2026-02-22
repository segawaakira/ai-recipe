import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailVerificationService } from './email-verification.service';

@Global()
@Module({
  providers: [EmailService, EmailVerificationService],
  exports: [EmailService, EmailVerificationService],
})
export class EmailModule {}
