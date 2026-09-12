import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly mailService: MailService,
  ) { }

  async create(userData: any): Promise<User> {
    let passwordHash = userData.passwordHash;

    if (userData.password && !passwordHash) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(userData.password, salt);
    }

    const { password, ...userEntityData } = userData;

    const newUser = this.usersRepo.create({
      ...userEntityData,
      passwordHash,
    } as Partial<User>);

    const savedUser = await this.usersRepo.save(newUser);

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
    return await this.usersRepo.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
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




  // পাসওয়ার্ড পরিবর্তনের মেথড
  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // পাসওয়ার্ড ভ্যালিডেশনের জন্য passwordHash সহ ইউজার কোয়েরি
    const user = await this.usersRepo.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!user.passwordHash) {
      throw new BadRequestException('Password is not set for this account');
    }

    // বর্তমান পাসওয়ার্ড ভ্যালিডেশন
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
} BadRequestException
