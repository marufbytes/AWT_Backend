import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()

export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}


  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepo.create(userData);
    return await this.usersRepo.save(newUser);
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


// partial for compile time
  async update(id: number, updateData: Partial<User>): Promise<User> {
    await this.findOne(id);
    await this.usersRepo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.usersRepo.softDelete(id);
  }
}