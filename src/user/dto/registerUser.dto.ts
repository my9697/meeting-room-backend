import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  @ApiProperty()
  username: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '用户组不能为空',
  })
  group: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '部门不能为空',
  })
  department: string;

  @IsNotEmpty({ message: '昵称不能为空' })
  @ApiProperty()
  nickName: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码不能低于六位' })
  @ApiProperty()
  password: string;

  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '不是合法邮箱格式' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  @ApiProperty()
  captcha: string;
}
