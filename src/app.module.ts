import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/users.module';
import { ResumeModule } from './resume/resume.module';
import { InternshipModule } from './internship/internship.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'alfaz', 
      database: 'internnova_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    ResumeModule,
    InternshipModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}