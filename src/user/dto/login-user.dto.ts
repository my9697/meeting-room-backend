import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  @ApiProperty()
  username: string;

  @IsNotEmpty({
    message: '密码不能为空',
  })
  @ApiProperty()
  password: string;
}

export class EmailLoginUserDto {
  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @ApiProperty()
  email: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  @ApiProperty()
  captcha: string;
}
