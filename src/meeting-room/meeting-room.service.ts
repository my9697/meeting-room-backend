import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private repository: Repository<MeetingRoom>;

  initData() {
    const room1 = new MeetingRoom();
    room1.name = 'Q';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '405';

    const room2 = new MeetingRoom();
    room2.name = 'W';
    room2.capacity = 5;
    room2.equipment = '投影';
    room2.location = '307';

    const room3 = new MeetingRoom();
    room3.name = 'E';
    room3.capacity = 30;
    room3.equipment = '白板,电视';
    room3.location = '505';

    this.repository.insert([room1, room2, room3]);
  }

  async find(status: string, capacity: number, equipment: string) {
    const condition: Record<string, any> = {};

    if (status === '不可预订') {
      condition.isBooked = 1;
    } else if (status === '可预订') {
      condition.isBooked = 0;
    }

    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }
    if (capacity) {
      condition.capacity = capacity;
    }

    const [meetingRooms, totalCount] = await this.repository.findAndCount({
      where: condition,
    });
    return {
      meetingRooms,
      totalCount,
    };
  }

  async create(meetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.repository.findOneBy({
      name: meetingRoomDto.name,
    });

    if (room) {
      throw new BadRequestException('会议室名字已存在');
    }

    return await this.repository.insert(meetingRoomDto);
  }

  async update(meetingRoomDto: UpdateMeetingRoomDto) {
    const meetingRoom = await this.repository.findOneBy({
      id: meetingRoomDto.id,
    });

    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }
    meetingRoom.capacity = meetingRoomDto.capacity;
    meetingRoom.location = meetingRoomDto.location;
    meetingRoom.name = meetingRoomDto.name;

    if (meetingRoomDto.description) {
      meetingRoom.description = meetingRoomDto.description;
    }
    if (meetingRoomDto.equipment) {
      meetingRoom.equipment = meetingRoomDto.equipment;
    }

    await this.repository.update(
      {
        id: meetingRoom.id,
      },
      meetingRoom,
    );
    return 'success';
  }

  async findById(id: number) {
    return this.repository.findOneBy({ id });
  }

  async deleteById(id: number) {
    await this.repository.delete({
      id,
    });

    return 'success';
  }
}
