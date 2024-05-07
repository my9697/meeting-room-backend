import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInfoDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  headPic: string;
  @ApiProperty()
  nickName: string;
  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail(
    {},
    {
      message: '不是合法邮箱',
    },
  )
  @ApiProperty()
  email: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  @ApiProperty()
  captcha: string;
}
