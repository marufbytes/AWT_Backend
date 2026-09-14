import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AlumniService } from './alumni.service';
import { CreateReferralPostDto } from './dto/create-referral-post.dto';
import { UpdateReferralPostStatusDto } from './dto/update-referral-post-status.dto';
import { RespondReferralApplicationDto } from './dto/respond-referral-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../user/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('alumni')
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  // Create a referral post
  @Post('posts')
  @Roles(UserRole.ALUMNI)
  createReferralPost(
    @Body() dto: CreateReferralPostDto,
    @GetUser() user: User,
  ) {
    return this.alumniService.createReferralPost(user.id, dto);
  }

  // Get my referral posts
  @Get('posts/mine')
  @Roles(UserRole.ALUMNI)
  getMyReferralPosts(@GetUser() user: User) {
    return this.alumniService.getMyReferralPosts(user.id);
  }

  // Get pending referral posts
  @Get('posts/pending')
  @Roles(UserRole.ADMIN)
  getPendingReferralPosts() {
    return this.alumniService.getPendingReferralPosts();
  }

  // Get approved referral posts
  @Get('posts')
  @Roles(UserRole.STUDENT, UserRole.ALUMNI, UserRole.ADMIN)
  getApprovedReferralPosts() {
    return this.alumniService.getApprovedReferralPosts();
  }

  // Get a referral post by id
  @Get('posts/:id')
  @Roles(UserRole.STUDENT, UserRole.ALUMNI, UserRole.ADMIN)
  getReferralPostById(@Param('id', ParseIntPipe) id: number) {
    return this.alumniService.getReferralPostById(id);
  }

  // Update referral post status
  @Patch('posts/:id/status')
  @Roles(UserRole.ADMIN)
  updateReferralPostStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReferralPostStatusDto,
  ) {
    return this.alumniService.updateReferralPostStatus(id, dto);
  }

  // Get unplaced students
  @Get('students/unplaced')
  @Roles(UserRole.ALUMNI)
  getUnplacedStudents() {
    return this.alumniService.getUnplacedStudents();
  }

  // Apply to a referral post
  @Post('posts/:id/apply')
  @Roles(UserRole.STUDENT)
  applyToReferralPost(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.alumniService.applyToReferralPost(id, user.id);
  }

  // Get applications for alumni
  @Get('applications')
  @Roles(UserRole.ALUMNI)
  getApplicationsForAlumni(@GetUser() user: User) {
    return this.alumniService.getApplicationsForAlumni(user.id);
  }

  // Get applications for student
  @Get('applications/mine')
  @Roles(UserRole.STUDENT)
  getApplicationsForStudent(@GetUser() user: User) {
    return this.alumniService.getApplicationsForStudent(user.id);
  }

  // Get accepted application count
  @Get('applications/accepted-count')
  @Roles(UserRole.ALUMNI)
  getAcceptedApplicationCount(@GetUser() user: User) {
    return this.alumniService.getAcceptedApplicationCount(user.id);
  }

  // Respond to an application
  @Patch('applications/:id/respond')
  @Roles(UserRole.ALUMNI)
  respondToApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RespondReferralApplicationDto,
    @GetUser() user: User,
  ) {
    return this.alumniService.respondToApplication(id, user.id, dto);
  }
}
