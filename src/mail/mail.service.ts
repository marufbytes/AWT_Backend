import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendProfileCreationEmail(userEmail: string, userName: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Welcome to InternNova!',
      html: `
        <h3>Hey ${userName},</h3>
        <p>Welcome to InternNova! Your profile has been successfully created.</p>
        <p>You can now start setting up your resume and applying for internships.</p>
      `,
    });
  }


  async sendProfileUpdateEmail(userEmail: string, userName: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'InternNova - Your Profile Has Been Updated',
      html: `
        <h3>Hello ${userName},</h3>
        <p>Your InternNova profile information has been successfully updated.</p>
        <p>For any support, please contact our team immediately.</p>
      `,
    });
  }




  async sendReferralVerificationEmail(
    alumniEmail: string,
    appId: number,
    rawToken: string,
  ) {
    const actionUrl = `http://localhost:3001/verify-referral?appId=${appId}&token=${rawToken}`;
    
    await this.mailerService.sendMail({
      to: alumniEmail,
      subject: 'InternNova - Student Referral Approval Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0f172a;">InternNova Referral Request</h2>
          <p>Hello,</p>
          <p>A student has applied for an internship on InternNova and listed your email for a referral approval.</p>
          <p>Please review this request within 24 hours by clicking the button below:</p>
          <a href="${actionUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0f172a; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">Review Referral</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">If you did not expect this, you can safely ignore this email.</p>
        </div>
      `,
    });
  }


}
