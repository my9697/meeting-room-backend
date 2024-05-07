import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  HttpStatus,
} from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { generateParseIntPipe } from 'src/utils/utils';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import {
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('会议室管理模块')
@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @ApiQuery({
    name: 'name',
    type: String,
    description: '会议室名字',
    required: false,
  })
  @ApiQuery({
    name: 'capacity',
    type: String,
    description: '容纳量',
    required: false,
  })
  @ApiQuery({
    name: 'equipment',
    type: String,
    description: '设备',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: String,
  })
  @Get('list')
  async list(
    @Query('status') status: string,
    @Query('capacity') capacity: number,

    @Query('equipment') equipment: string,
  ) {
    return await this.meetingRoomService.find(status, capacity, equipment);
  }

  @ApiBody({ type: CreateMeetingRoomDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: String,
  })
  @Post('create')
  async create(@Body() meetingRoomDto: CreateMeetingRoomDto) {
    return await this.meetingRoomService.create(meetingRoomDto);
  }

  @ApiBody({ type: UpdateMeetingRoomDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: String,
  })
  @Post('update')
  async update(@Body() meetingRoomDto: UpdateMeetingRoomDto) {
    return await this.meetingRoomService.update(meetingRoomDto);
  }

  @ApiParam({
    name: 'id',
    type: Number,
    description: 'id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: String,
  })
  @Get(':id')
  async find(@Param('id') id: number) {
    return await this.meetingRoomService.findById(id);
  }

  @ApiParam({
    name: 'id',
    type: Number,
    description: 'id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: String,
  })
  @Delete(':id')
  async delete(@Param('id') id: number) {
    console.log(id);

    return await this.meetingRoomService.deleteById(id);
  }
}
