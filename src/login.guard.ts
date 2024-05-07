import {
  // 用于访问授权控制器的方法
  CanActivate,
  // 请求的执行上下文
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// 允许处理异步操作的一种机制
import { Observable } from 'rxjs';
// 动态的创建、操作和访问类，方法，属性
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Permission } from './user/entities/permission.entity';
import { UnLoginException } from './unlogin.filter';

interface JwtUserData {
  email: string;
  userId: number;
  username: string;
  roles: string[];
  permission: Permission[];
}
// 声明express模块
// 在声明express里面协商类型，提高代码的可读性，能知道数据的属性就能更好的去处理数据
declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}
@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //切换到Http执行上下文，然后取出请求对象
    const request: Request = context.switchToHttp().getRequest();
    // getAllAndOverride方法（他会覆盖原始值）是从reflector上获取requireLogin。
    //将获取的值与传入的 context.getClass(),context.getHandler()进行合并
    // 这一步的目的是动态配置权限控制，保证需要获取资源时先进行登录
    const requireLgin = this.reflector.getAllAndOverride('require-login', [
      // 下面的两个方法实现了能根据不同类进行不同的处理
      // 获取当前的请求类
      context.getClass(),
      // 用于获取处理当前类的处理器
      context.getHandler(),
    ]);

    if (!requireLgin) {
      return true;
    }

    const authorization = request.headers.authorization;

    if (!authorization) {
      // throw new UnauthorizedException('用户未登录');
      throw new UnLoginException();
    }
    try {
      const token = authorization.split(' ')[1];

      const data = this.jwtService.verify<JwtUserData>(token);

      request.user = {
        email: data.email,
        userId: data.userId,
        username: data.username,
        roles: data.roles,
        permission: data.permission,
      };
      return true;
    } catch (e) {
      throw new UnauthorizedException('token失效请重新登录');
    }
  }
}
