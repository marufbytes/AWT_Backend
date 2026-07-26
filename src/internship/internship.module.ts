import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternshipService } from './internship.service';
import { InternshipController } from './internship.controller';
import { Internship } from './entities/internship.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Internship])], 
  controllers: [InternshipController],
  providers: [InternshipService],
  exports: [InternshipService],
})
export class InternshipModule {}