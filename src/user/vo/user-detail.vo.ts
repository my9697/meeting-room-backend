import { ApiProperty } from '@nestjs/swagger';

export class UserDetailVo {
  @ApiProperty()
  id: number;
  @ApiProperty({ example: 'zhangsan' })
  username: string;
  @ApiProperty({ example: '张三' })
  nickName: string;
  @ApiProperty({ example: 'xx@qq.com' })
  email: string;
  @ApiProperty({ example: 'xx.png' })
  headPic: string;
  @ApiProperty({ example: '12345678901' })
  phoneNumber: string;
  @ApiProperty()
  isFrozen: boolean;
  @ApiProperty()
  createTime: Date;
}
