import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Company } from '../company/entities/company.entity';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly mailService: MailService,
  ) {}

  async create(userData: any): Promise<User> {
    // ১. ইমেইল ডুপ্লিকেট চেক (Conflict 409)
    const existingEmail = await this.findByEmail(userData.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // ২. ফোন নম্বর ডুপ্লিকেট চেক
    if (userData.phone) {
      const existingPhone = await this.usersRepo.findOne({
        where: { phone: userData.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // ৩. পাসওয়ার্ড হ্যাশ করা
    let passwordHash = userData.passwordHash;
    if (userData.password && !passwordHash) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(userData.password, salt);
    }

    // ৪. HR হলে কোম্পানি হ্যান্ডেল করা (টাইপ এক্সপ্লিসিটলি ডিফাইন করা হলো)
    let companyEntity: Company | null = null;
    if (userData.role === UserRole.HR && userData.companyName) {
      companyEntity = await this.companyRepo.findOne({
        where: { name: userData.companyName },
      });
      if (!companyEntity) {
        companyEntity = this.companyRepo.create({
          name: userData.companyName,
          industry: userData.industry || 'General',
        });
        companyEntity = await this.companyRepo.save(companyEntity);
      }
    }

    // ৫. পে-লোড থেকে আনওয়ান্টেড ফিল্ড ফিল্টার করা
    const { password, companyName, industry, ...userEntityData } = userData;

    const newUser = this.usersRepo.create({
      ...userEntityData,
      passwordHash,
      company: companyEntity || undefined,
    } as Partial<User>);

    const savedUser = await this.usersRepo.save(newUser);

    // ৬. ওয়েলকাম ইমেইল পাঠানো
    if (savedUser.email) {
      this.mailService
        .sendProfileCreationEmail(
          savedUser.email,
          savedUser.firstName || 'User',
        )
        .catch((error) =>
          console.error('Failed to send welcome email:', error),
        );
    }

    delete (savedUser as any).passwordHash;
    delete (savedUser as any).password;

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepo.find({ relations: { company: true } });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: { company: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepo.findOne({ where: { email } });
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    await this.findOne(id);
    await this.usersRepo.update(id, updateData);
    const updatedUser = await this.findOne(id);

    const isTokenUpdateOnly =
      'hashedRefreshToken' in updateData &&
      Object.keys(updateData).length === 1;

    if (updatedUser.email && !isTokenUpdateOnly) {
      this.mailService
        .sendProfileUpdateEmail(
          updatedUser.email,
          updatedUser.firstName || 'User',
        )
        .catch((error) => console.error('Failed to send update email:', error));
    }

    return updatedUser;
  }

  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!user.passwordHash) {
      throw new BadRequestException('Password is not set for this account');
    }

    const isMatched = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatched) {
      throw new BadRequestException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await this.usersRepo.update(id, { passwordHash: newPasswordHash });

    if (user.email) {
      this.mailService
        .sendProfileUpdateEmail(user.email, user.firstName || 'User')
        .catch((error) =>
          console.error('Failed to send password update email:', error),
        );
    }

    return { message: 'Password updated successfully' };
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.usersRepo.softDelete(id);
  }
}