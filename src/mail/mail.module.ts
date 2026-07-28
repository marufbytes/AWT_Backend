import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'mdalfaz555@gmail.com', 
          pass: 'wdjooswpnybbkkgw', 
        },
      },
      defaults: {
        from: '"InternNova" <mdalfaz555@gmail.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService], 
})
export class MailModule {}