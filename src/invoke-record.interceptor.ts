import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Response, Request } from 'express';

@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
  // 将名字传入Logger,可以区分不同的日志
  private readonly logger = new Logger(InvokeRecordInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    // 获取请求头中的userAgent字段的值，该字段用于客户端的设备信息
    const userAgent = request.headers['user-agent'];
    const { ip, method, path } = request;
    // 记录关于调试信息的日志
    this.logger.debug(
      `${method}${path}${ip}${userAgent}:${context.getClass().name}${
        context.getHandler().name
      }...invoked`,
    );

    this.logger.debug(`user:${request.user?.userId}${request.user?.username}`);
    const now = Date.now();
    // 目的：记录请求的详细信息和响应数据
    return next.handle().pipe(
      // tap更适合用于处理响应数据。map更适合对每一个函数进行处理
      tap((res) => {
        this.logger.debug(
          `${method}${path}${ip}${userAgent}:${response.statusCode}:${
            Date.now() - now
          }ms`,
        );
        this.logger.debug(`Response:${JSON.stringify(res)}`);
      }),
    );
  }
}
