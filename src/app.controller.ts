import { Controller, Get, Body, Post, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import { ReqirePermission, RequireLogin, UserInfo } from './utils/index';
import { userInfo } from 'os';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Body() body) {
    return this.appService.getHello();
  }
}
