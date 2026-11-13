import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../user/entities/user.entity';
import { ReferralService } from './referral.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get()
  @Roles(UserRole.ALUMNI, UserRole.STUDENT)
  list(@GetUser() user: User) {
    return this.referralService.list(user);
  }

  @Post()
  @Roles(UserRole.STUDENT)
  create(@Body() dto: CreateReferralDto, @GetUser() user: User) {
    return this.referralService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ALUMNI)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReferralDto,
    @GetUser() user: User,
  ) {
    return this.referralService.update(id, dto, user);
  }
}
