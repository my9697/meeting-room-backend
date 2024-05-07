import { Observable } from 'rxjs';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request) {
      return true;
    }
    const permission = request.user?.permission;
    const requirePermission = this.reflector.getAllAndOverride(
      'require-permission',
      [context.getClass(), context.getHandler()],
    );
    if (!requirePermission) {
      return true;
    }

    for (let i = 0; i < requirePermission.length; i++) {
      const curPermission = requirePermission[i];
      const found = permission.find((item) => item.code === curPermission);
      if (!found) {
        throw new UnauthorizedException('您没有范文接口的权限');
      }
    }
    return true;
  }
}
