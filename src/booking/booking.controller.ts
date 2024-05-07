import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import { BookingService } from './booking.service';
import { generateParseIntPipe } from 'src/utils/utils';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('预定模块')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiQuery({
    name: 'pageNo',
    type: Number,
    description: '页码',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    description: '每页的数据条数',
    required: false,
  })
  @ApiQuery({
    name: 'username',
    type: String,
    description: '用户名字',
    required: false,
  })
  @ApiQuery({
    name: 'meetingRoomName',
    type: String,
    description: '会议室名字',
    required: false,
  })
  @ApiQuery({
    name: 'meetingRoomPosition',
    type: String,
    description: '位置',
    required: false,
  })
  @ApiQuery({
    name: 'bookingStartTimg',
    type: String,
    description: '开始时间',
    required: false,
  })
  @ApiQuery({
    name: 'bookingTimeEnd',
    type: String,
    description: '结束时间',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: String,
  })
  @Get('list')
  async list(
    @Query('username') username: string,
    @Query('meetingRoomName') meetingRoomName: string,
    @Query('meetingRoomPosition') meetingRoomPosition: string,
    @Query('bookingStartTimg') bookingStartTimg: string,
    @Query('bookingTimeEnd') bookingTimeEnd: string,
  ) {
    return this.bookingService.find(
      username,
      meetingRoomName,
      meetingRoomPosition,
      bookingStartTimg,
      bookingTimeEnd,
    );
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
  @Get('apply/:id')
  async apply(@Param('id') id: number) {
    return this.bookingService.apply(id);
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
  @Get('reject/:id')
  async reject(@Param('id') id: number) {
    return this.bookingService.reject(id);
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
  @Get('unbind/:id')
  async unbind(@Param('id') id: number) {
    return this.bookingService.unbind(id);
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
  @Get('urge/:id')
  async urge(@Param('id') id: number) {
    return this.bookingService.urge(id);
  }

  @ApiParam({
    name: 'time',
    type: Number,
    description: '查询的时间',
  })
  @ApiParam({
    name: 'department',
    type: Number,
    description: '查询的部门',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: String,
  })
  @Get('time')
  async time(
    @Query('time') time: string,
    @Query('department') department: string,
  ) {
    return this.bookingService.history(time, department);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: String,
  })
  @Get('allDepartments')
  async allDepartments() {
    return this.bookingService.getAllDepartments();
  }
  @Get('wordCloud')
  async cloud(@Query('department') department: string) {
    return this.bookingService.getWord(department);
  }
}
