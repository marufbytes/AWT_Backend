import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../user/users.service';
import { CompanyService } from '../company/company.service';
import { Company } from '../company/entities/company.entity';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly companyService: CompanyService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Defense in depth: public registration can never create an ADMIN
    if (registerDto.role === UserRole.ADMIN) {
      throw new ForbiddenException(
        'Admin accounts cannot be created through public registration',
      );
    }
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new BadRequestException(
        'User with this email already exists',
      );
    }

    // Hash password
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      saltRounds,
    );

    // Remove password and company information
    // from user data
    const {
      password,
      companyName,
      industry,
      ...userData
    } = registerDto;

    // Company can be either Company or undefined
    let company: Company | undefined;

    // If user is HR, create a company
    if (registerDto.role === UserRole.HR) {
      // Company name is required for HR
      if (!companyName) {
        throw new BadRequestException(
          'Company name is required for HR registration',
        );
      }

      // Industry is required for HR
      if (!industry) {
        throw new BadRequestException(
          'Industry is required for HR registration',
        );
      }

      // Create company
      company = await this.companyService.createCompany({
        name: companyName,
        industry: industry,
      });
    }

    // Create user
    const user = await this.usersService.create({
      ...userData,
      passwordHash: hashedPassword,

      // If HR, attach the created company
      ...(company ? { company } : {}),
    });

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    this.usersService.assertAccountAccess(user);

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
    );

    await this.updateRefreshTokenHash(
      user.id,
      tokens.refreshToken,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  }

  async logout(userId: number) {
    await this.usersService.update(
      userId,
      {
        hashedRefreshToken: null,
      } as any,
    );

    return {
      message: 'Logged out successfully',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const email = dto.email.trim().toLowerCase();
    const newPassword = dto.newPassword ?? dto.password;
    if (!newPassword) {
      throw new BadRequestException('A new password is required');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No user found with this email address');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, {
      passwordHash,
      hashedRefreshToken: null,
    } as any);

    return { message: 'Password reset successfully' };
  }

  private async generateTokens(
    userId: number,
    email: string,
    role: string,
  ) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] =
      await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: 'Access_Token_Key',
          expiresIn: '1d',
        }),

        this.jwtService.signAsync(payload, {
          secret: 'Refresh_TOken_Key',
          expiresIn: '7d',
        }),
      ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshTokenHash(
    userId: number,
    refreshToken: string,
  ) {
    const hash = await bcrypt.hash(
      refreshToken,
      10,
    );

    await this.usersService.update(
      userId,
      {
        hashedRefreshToken: hash,
      } as any,
    );
  }
}
