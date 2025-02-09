import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMeetingRoomDto } from './create-meeting-room.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateMeetingRoomDto extends PartialType(CreateMeetingRoomDto) {
  @IsNotEmpty({
    message: 'id不能为空',
  })
  @ApiProperty()
  id: number;

  @ApiProperty()
  isBooked: boolean;
}
