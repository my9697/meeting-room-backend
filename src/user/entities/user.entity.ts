import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    length: 50,
    comment: '用户名',
    unique: true,
  })
  username: string;
  @ApiProperty()
  @Column({
    comment: '小组',
  })
  group: string;
  @ApiProperty()
  @Column({
    comment: '部门',
  })
  department: string;
  @Column({
    length: 50,
    comment: '密码',
  })
  password: string;
  @Column({
    length: 50,
    comment: '邮箱',
  })
  email: string;
  @Column({
    length: 50,
    comment: '昵称',
  })
  nickName: string;
  @Column({
    length: 100,
    comment: '头像',
    nullable: true,
  })
  headPic: string;
  @Column({
    length: 11,
    nullable: true,
    comment: '手机号',
  })
  phoneNumber: string;
  @Column({
    default: false,
    comment: '是否冻结',
  })
  isFrozen: boolean;
  @Column({
    default: false,
    comment: '是否是管理员',
  })
  isAdmin: boolean;
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
  @ManyToMany(() => Role, { cascade: true })
  @JoinTable({
    name: 'user_role',
  })
  roles: Role[];
}
