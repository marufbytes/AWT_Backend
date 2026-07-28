import { Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}

  async create(userData: any): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = this.usersRepo.create({
      ...userData,
      passwordHash: hashedPassword, 
    } as Partial<User>);
    
    const savedUser = await this.usersRepo.save(newUser);

    if (savedUser.email) {
      this.mailService
        .sendProfileCreationEmail(savedUser.email, savedUser.firstName || 'User')
        .catch((error) => console.error('Failed to send welcome email:', error));
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

    if (updatedUser.email) {
      this.mailService
        .sendProfileUpdateEmail(updatedUser.email, updatedUser.firstName || 'User')
        .catch((error) => console.error('Failed to send update email:', error));
    }

    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.usersRepo.softDelete(id);
  }
}