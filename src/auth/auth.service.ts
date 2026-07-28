import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../user/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}



  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const { password, ...userData } = registerDto;

    return await this.usersService.create({
      ...userData,
      passwordHash: hashedPassword,
    });
  }



  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

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
    await this.usersService.update(userId, { hashedRefreshToken: null } as any);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: 'Access_Token_Key',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: 'Refresh_TOken_Key',
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { hashedRefreshToken: hash } as any);
  }
}