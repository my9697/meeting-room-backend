import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

// 由于异常的类型有很多种，如果我们逐一为其自定义这不太现实(code,message,data的格式)
// 所以我们不妨直接修改对HttpException的处理逻辑就好
// 但是这样处理还有个问题就是对于ValidationPipe的报错返回的信息没那么准确
@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      const response = host.switchToHttp().getResponse();
      response.statusCode = exception.getStatus();
      const res = exception.getResponse() as { message: string[] };

      response
        .json({
          code: exception.getStatus(),
          message: 'fail',
          data: res?.message || exception.message,
        })
        .end();
    } else {
      // 处理其他类型的异常
    }

    // 因为对于一些返回的信息没那么准确，所以可以分别获取请求对象和异常类身上的Response
    // 区别在于前者的的Response包含与Http响应有关的信息，后者包含和异常信息有关的响应
  }
}
