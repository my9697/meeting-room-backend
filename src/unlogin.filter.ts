import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

// 为了让修改更新成功与失败的信息一致，我们就得自定义异常响应的格式

export class UnLoginException {
  message: string;
  // ?是可选参数
  constructor(message?: string) {
    this.message = message;
  }
}

// @Catch（）的参数可以指定具体的异常类型
@Catch(UnLoginException)
export class UnloginFilter implements ExceptionFilter {
  //exception是异常对象，host是ArgumentsHost类型，是执行上下文
  catch(exception: UnLoginException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    // end()确保响应被正确结束，客户端获得状态码以及错误信息，同时会释放和响应相关的资源
    response
      .json({
        code: HttpStatus.UNAUTHORIZED,
        message: 'fail',
        data: exception.message || '用户未登录',
      })
      .end();
  }
}
