import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
// forFeature是局部导入，适用于特定功能的局部模块
// forRoot是全局导入，适用于全局配置，在生命周期中具有唯一性，其他模块均可共享
