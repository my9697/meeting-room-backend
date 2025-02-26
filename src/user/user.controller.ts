import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Inject,
  UnauthorizedException,
  BadRequestException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDto, EmailLoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequireLogin, UserInfo } from 'src/utils';
import { UserDetailVo } from './vo/user-detail.vo';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserInfoDto } from './dto/update-userinfo.dto';
import {
  ApiTags,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { loginUserVo } from './vo/login-user.vo';
import { RefreshToken } from './vo/refresh-token.vo';
import { UserList } from './vo/user-list.vo';
import { Permission } from './entities/permission.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { storage } from 'src/my-upload-storage';

interface JwtUserData {
  email: string;
  userId: number;
  username: string;
  roles: string[];
  permission: Permission[];
}

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @ApiBody({
    type: RegisterUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码不正确/用户已存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/失败',
    type: String,
  })
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @ApiQuery({
    name: 'address',
    type: String,
    description: '邮箱地址',
    required: true,
    example: 'xx@qq.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    // 随机生成一个六位数（验证码）
    const code = Math.random().toString().slice(2, 8);
    // 把生成的六位数存储到redis中，key为catpcha_${address},value为code,有效时间为5分钟

    await this.redisService.set(`captcha_${address}`, code, 5 * 60);
    return this.redisService.get(`captcha_${address}`);

    // 发送验证码到指定地址
    // await this.emailService.sendMail({
    //   to: '3173714073@qq.com',
    //   subject: '注册验证码',
    //   html: `<p>你的注册验证码是${code}</p>`,
    // });
    // return '发送成功';
  }

  @Get('init-data')
  async iniData() {
    await this.userService.iniData();
    return 'done';
  }

  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户名不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和token',
    type: loginUserVo,
  })
  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, false);
    // jwt是身份验证的令牌
    // 这里是生成访问令牌
    // 访问令牌是用户用于获取资源时验证身份的一种凭证
    vo.accessToken = this.jwtService.sign(
      {
        email: vo.userInfo.email,
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permission: vo.userInfo.permission,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    // 这里是生成刷新令牌
    // 刷新令牌是用户的访问令牌过期了，用户不需要再次进行身份验证，通过刷新令牌进行验证得到新的访问令牌
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '7d',
      },
    );

    return vo;
  }

  @Post('emailLogin')
  async emailLogin(@Body() loginUser: EmailLoginUserDto) {
    const vo = await this.userService.emailLogin(loginUser, false);
    // jwt是身份验证的令牌
    // 这里是生成访问令牌
    // 访问令牌是用户用于获取资源时验证身份的一种凭证
    vo.accessToken = this.jwtService.sign(
      {
        email: vo.userInfo.email,
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permission: vo.userInfo.permission,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    // 这里是生成刷新令牌
    // 刷新令牌是用户的访问令牌过期了，用户不需要再次进行身份验证，通过刷新令牌进行验证得到新的访问令牌
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '7d',
      },
    );

    return vo;
  }

  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户名不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和token',
    type: loginUserVo,
  })
  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true);
    // jwt是身份验证的令牌
    // 这里是生成访问令牌
    // 访问令牌是用户用于获取资源时验证身份的一种凭证
    vo.accessToken = this.jwtService.sign(
      {
        email: vo.userInfo.email,
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permission: vo.userInfo.permission,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    // 这里是生成刷新令牌
    // 刷新令牌是用户的访问令牌过期了，用户不需要再次进行身份验证，通过刷新令牌进行验证得到新的访问令牌
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '7d',
      },
    );
    return vo;
  }

  @Post('admin/emailLogin')
  async adminEmailLogin(@Body() loginUser: EmailLoginUserDto) {
    const vo = await this.userService.emailLogin(loginUser, true);
    // jwt是身份验证的令牌
    // 这里是生成访问令牌
    // 访问令牌是用户用于获取资源时验证身份的一种凭证
    vo.accessToken = this.jwtService.sign(
      {
        email: vo.userInfo.email,
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permission: vo.userInfo.permission,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    // 这里是生成刷新令牌
    // 刷新令牌是用户的访问令牌过期了，用户不需要再次进行身份验证，通过刷新令牌进行验证得到新的访问令牌
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '7d',
      },
    );

    return vo;
  }

  // 刷新token
  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新Token',
    required: true,
    example: 'xxxyyyzzz',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshToken,
  })
  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(data.userId, false);
      const access_token = this.jwtService.sign(
        {
          email: user.email,
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permission: user.permission,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );
      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );
      const vo = new RefreshToken();

      vo.access_token = access_token;
      vo.refresh_token = refresh_token;
      return vo;
    } catch (e) {
      throw new UnauthorizedException('token已失效，请重新登录');
    }
  }

  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新Token',
    required: true,
    example: 'xxxyyyzzz',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshToken,
  })
  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      // verify是检查jwt是否过期，验证通过则说明没有过期，过期了就返回无效的jwt
      const data = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(data.userId, true);
      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permission: user.permission,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );
      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );
      const vo = new RefreshToken();

      vo.access_token = access_token;
      vo.refresh_token = refresh_token;
      return vo;
    } catch (e) {
      throw new UnauthorizedException('token已失效请重新登录');
    }
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: UserDetailVo,
  })
  @ApiBearerAuth()
  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);
    const vo = new UserDetailVo();
    vo.id = user.id;
    vo.username = user.username;
    vo.nickName = user.nickName;
    vo.email = user.email;
    vo.headPic = user.headPic;
    vo.phoneNumber = user.phoneNumber;
    vo.isFrozen = user.isFrozen;
    vo.createTime = user.createTime;
    return vo;
  }

  @ApiBody({
    type: UpdatePasswordDto,
  })
  @ApiResponse({
    type: String,
    description: '验证已失效/不正确',
  })
  @Post(['update_password', 'admin/update_password'])
  async updatePassword(@Body() passwordDto: UpdatePasswordDto) {
    return await this.userService.updatePassword(passwordDto);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'address',
    description: '邮箱地址',
    type: String,
  })
  @ApiResponse({
    type: String,
    description: '发送成功',
  })
  @ApiBody({
    type: UpdateUserInfoDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/不正确',
  })
  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(@Body() updateUserInfo: UpdateUserInfoDto) {
    return await this.userService.update(updateUserInfo);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'upload',
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 3,
      },
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname);
        if (['.png', '.jpg', '.gif'].includes(extname)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('只能上传图片'), false);
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);
    return file.path;
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'adress',
    description: '用户那边从localStore里面取出的注册时用的邮箱地址',
    type: String,
  })
  @ApiResponse({
    type: String,
    description: '发送成功',
  })
  @Get('update_userInfo/captcha')
  @RequireLogin()
  async updateUserInfoCaptcha(@Query('adress') adress: string) {
    const code = Math.random().toString().slice(2, 8);
    this.redisService.set(`update_user_captcha_${adress}`, code, 10 * 60);

    return '发送成功';
    // await this.emailService.sendMail({
    //   to: address,
    //   subject: '更改用户信息',
    //   html: `<p>你的验证码是${code}</p>`,
    // });
    // return '发送成功';
  }

  @ApiQuery({
    name: 'adress',
    description: '邮箱地址',
    type: String,
  })
  @ApiResponse({
    type: String,
    description: '发送成功',
  })
  @Get(['update_password/captcha', 'admin/update_password/captcha'])
  async updatePasswordCaptcha(@Query('adress') adress: string) {
    const code = Math.random().toString().slice(2, 8);
    this.redisService.set(`update_password_captcha_${adress}`, code, 10 * 60);
    // await this.emailService.sendMail({
    //   to: adress,
    //   subject: '更改用户信息',
    //   html: `<p>你的验证码是${code}</p>`,
    // });
    return '发送成功';
  }

  @ApiQuery({
    name: 'adress',
    description: '邮箱地址',
    type: String,
  })
  @ApiResponse({
    type: String,
    description: '发送成功',
  })
  @Get(['emailLogin/captcha', 'admin/emailLogin/captcha'])
  async emailLoginCaptcha(@Query('adress') adress: string) {
    const code = Math.random().toString().slice(2, 8);
    this.redisService.set(`email_login_captcha_${adress}`, code, 10 * 60);
    return '发送成功';
    // await this.emailService.sendMail({
    //   to: address,
    //   subject: '更改用户信息',
    //   html: `<p>你的验证码是${code}</p>`,
    // });
    // return '发送成功';
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    description: 'userId',
    type: Number,
  })
  @ApiResponse({
    type: String,
    description: 'success',
  })
  @Post('freeze')
  @RequireLogin()
  async freeze(@Query('id') userId: number) {
    await this.userService.freezeUserById(userId);
    return 'success';
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
    description: '第几页',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页多少条',
    type: Number,
  })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    type: String,
  })
  @ApiQuery({
    name: 'nickName',
    description: '昵称',
    type: String,
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱地址',
    type: String,
  })
  @ApiResponse({
    type: UserList,
    description: '用户列表',
  })
  @Get('list')
  @RequireLogin()
  // 获取值，第一个是要获取的值，第二个是当参数中没有提供该属性时就设置默认值，第三个确保传入的pageNo和pageSize是数字类型,不然会报错
  // 这里我们进行了封装，封装成了generateParseIntPipe
  // 实现多用户列表的查询
  async list(
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
  ) {
    return await this.userService.findUserByPage(username, nickName, email);
  }
}
