import { ApiProperty } from '@nestjs/swagger';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({
    comment: '会议开始时间',
  })
  @ApiProperty()
  startTime: Date;

  @Column({
    comment: '会议结束时间',
  })
  @ApiProperty()
  endTime: Date;

  @Column({
    length: 20,
    comment: '状态（申请中、审批通过、审批驳回、已解除）',
    default: '申请中',
  })
  @ApiProperty()
  status: string;

  @Column({
    length: 100,
    comment: '备注',
    default: '',
  })
  @ApiProperty()
  note: string;

  @ManyToOne(() => User)
  @ApiProperty()
  user: User;

  @ManyToOne(() => MeetingRoom)
  @ApiProperty()
  room: MeetingRoom;

  @CreateDateColumn({
    comment: '创建时间',
  })
  @ApiProperty()
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  @ApiProperty()
  updateTime: Date;
}
