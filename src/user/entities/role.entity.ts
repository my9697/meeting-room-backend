import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';

@Entity({ name: 'role' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    length: 20,
    comment: '角色名',
  })
  name: string;
  // cascade为true当role表保存时会自动保存关联的表
  @ManyToMany(() => Permission, { cascade: true })
  @JoinTable({
    name: 'role_permission',
  })
  permission: Permission[];
}
