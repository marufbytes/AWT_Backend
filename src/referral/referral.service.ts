import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { Internship } from '../internship/entities/internship.entity';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';
import { Referral, ReferralStatus } from './entities/referral.entity';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(Referral) private readonly referralRepo: Repository<Referral>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Internship) private readonly internshipRepo: Repository<Internship>,
  ) {}

  async list(user: User): Promise<Referral[]> {
    const owner = user.role === UserRole.ALUMNI ? 'referrer' : 'student';
    return this.referralRepo.find({
      where: { [owner]: { id: user.id } } as any,
      relations: { student: true, referrer: true, internship: { company: true } },
      select: {
        id: true, targetRole: true, company: true, resumeUrl: true,
        message: true, status: true, createdAt: true,
        student: { id: true, firstName: true, lastName: true, email: true },
        referrer: { id: true, firstName: true, lastName: true, email: true },
        internship: { id: true, title: true, company: { id: true, name: true } },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateReferralDto, student: User): Promise<Referral> {
    const referrer = await this.userRepo.findOne({ where: { id: dto.referrerId }, relations: { company: true } });
    if (!referrer || referrer.role !== UserRole.ALUMNI) {
      throw new NotFoundException('Alumni referrer not found');
    }
    let internship: Internship | null = null;
    if (dto.internshipId) {
      internship = await this.internshipRepo.findOne({ where: { id: dto.internshipId }, relations: { company: true } });
      if (!internship) throw new NotFoundException('Internship not found');
    }
    const company = dto.company ?? internship?.company?.name ?? referrer.companyName ?? referrer.company?.name ?? null;
    return this.referralRepo.save(this.referralRepo.create({
      student, referrer, internship,
      targetRole: dto.targetRole ?? internship?.title ?? null,
      company,
      resumeUrl: dto.resumeUrl ?? null,
      message: dto.message ?? null,
      status: ReferralStatus.PENDING,
    }));
  }

  async update(id: number, dto: UpdateReferralDto, user: User): Promise<Referral> {
    if (dto.status !== ReferralStatus.ACCEPTED && dto.status !== ReferralStatus.REJECTED) {
      throw new BadRequestException('Referral status must be ACCEPTED or REJECTED');
    }
    const referral = await this.referralRepo.findOne({ where: { id }, relations: { referrer: true } });
    if (!referral) throw new NotFoundException('Referral request not found');
    if (referral.referrer.id !== user.id) throw new ForbiddenException('You can only manage requests sent to you');
    if (referral.status !== ReferralStatus.PENDING) throw new BadRequestException('Only pending requests can be updated');
    referral.status = dto.status;
    return this.referralRepo.save(referral);
  }
}
