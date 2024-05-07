import { Controller, Get, Inject, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {
  @Inject(StatisticService)
  private staticsticService: StatisticService;

  @Get('userBookingCount')
  async userBookingCount(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.staticsticService.userBookingCount(startTime, endTime);
  }

  @Get('meetingRoomUsedCount')
  async meetingRoomUsedCount(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.staticsticService.meetingRoomUserCount(startTime, endTime);
  }
}
