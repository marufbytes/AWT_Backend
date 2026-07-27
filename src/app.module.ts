import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/users.module';
import { ResumeModule } from './resume/resume.module';
import { InternshipModule } from './internship/internship.module';
import { CompanyModule } from './company/company.module';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin123', 
      database: 'internnova_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    ResumeModule,
    InternshipModule,
    CompanyModule,
    ApplicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
