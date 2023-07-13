import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Role } from './user/entities/role.entity';
import { Reflector } from '@nestjs/core';

declare module 'express' {
  interface Request {
    user: {
      username: string;
      roles: Role[];
    };
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject()
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler(),
    ]);

    console.log(`requireLogin: ${JSON.stringify(requireLogin)}`);

    if (!requireLogin) {
      return true;
    }

    const authorizathin = request.headers.authorization;

    if (!authorizathin) {
      throw new UnauthorizedException('用户未登录');
    }

    try {
      const token = authorizathin.split(' ')[1];
      const data = this.jwtService.verify(token);
      console.log('login: ', data, '--->>>--->>>===>>');
      request.user = data.user;
      return true;
    } catch (e) {
      throw new UnauthorizedException('token 失效，请重新登录！');
    }
  }
}
