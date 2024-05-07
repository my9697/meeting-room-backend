// 用来封装返回的数据的
import { Permission } from '../entities/permission.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserInfo {
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
  isAdmin: boolean;
  @ApiProperty()
  createTime: Date;
  @ApiProperty({ example: '[管理员]' })
  roles: string[];
  @ApiProperty({ example: 'query_aaa' })
  permission: Permission[];
}
export class loginUserVo {
  @ApiProperty()
  userInfo: UserInfo;
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}
