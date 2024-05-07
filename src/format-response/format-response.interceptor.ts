import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response: Response = context.switchToHttp().getResponse();
    // 对请求的数据进行处理，next.handle()承接上一操作处理的数据，把操作后的数据传给下一过程
    // map()对上一操作的数据进行处理，这里是对data进行包装，这里的map方法和数组的map方法不同，它可以处理异步数据
    // 用pipe实现链式调用，将一个过程的输出作为下一过程的输入
    return next.handle().pipe(
      map((data) => {
        return {
          code: response.statusCode,
          message: 'success',
          data,
        };
      }),
    );
  }
}
