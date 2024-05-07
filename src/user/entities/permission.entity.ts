import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'permission' })
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    length: 50,
    comment: '权限代码',
  })
  code: string;
  @Column({
    length: 100,
    comment: '权限描述',
  })
  description: string;
}
