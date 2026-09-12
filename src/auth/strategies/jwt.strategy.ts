import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../../user/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: (request: Request) => {
        // First try HttpOnly cookie
        if (request.cookies?.accessToken) {
          return request.cookies.accessToken;
        }

        // fallback to Authorization: Bearer token
        return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
      },

      ignoreExpiration: false,
      secretOrKey: 'Access_Token_Key',
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    role: string;
  }) {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return user;
  }
}
