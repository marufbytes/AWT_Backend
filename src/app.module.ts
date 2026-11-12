import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/users.module';
import { ResumeModule } from './resume/resume.module';
import { InternshipModule } from './internship/internship.module';
import { CompanyModule } from './company/company.module';
import { ApplicationModule } from './application/application.module';
import { AuthModule } from './auth/auth.module';
import { InterviewsModule } from './interview/interview.module';
import { MailModule } from './mail/mail.module';
import { UploadsController } from './uploads/uploads.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
<<<<<<< HEAD
      password:'1234',
=======
      password: 'admin123',
>>>>>>> 7505de0 (Update for student)
      database: "internnova_db",
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    ResumeModule,
    InternshipModule,
    CompanyModule,
    ApplicationModule,
    AuthModule,
    InterviewsModule,
    MailModule,

  ],
  controllers: [AppController, UploadsController],
  providers: [AppService],
})
export class AppModule { }
