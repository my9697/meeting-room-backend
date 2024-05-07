import {
  Body,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/registerUser.dto';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from '../utils/crypto';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto, EmailLoginUserDto } from './dto/login-user.dto';
import { loginUserVo } from './vo/login-user.vo';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserInfoDto } from './dto/update-userinfo.dto';
import { Like } from 'typeorm';
import { UserList } from './vo/user-list.vo';

@Injectable()
export class UserService {
  // logger和console,log的不同在于logger可以打印到日志里面，而console.log打印到控制台
  private logger = new Logger();

  @Inject(RedisService)
  private redisService: RedisService;

  @InjectRepository(User)
  private userRipository: Repository<User>;
  @InjectRepository(Role)
  private roleRepository: Repository<Role>;
  @InjectRepository(Permission)
  private permission: Repository<Permission>;

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);

    if (!captcha) {
      throw new HttpException('验证码失效', HttpStatus.BAD_REQUEST);
    }
    if (user.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }
    const foundUser = await this.userRipository.findOneBy({
      username: user.username,
    });
    if (foundUser) {
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }
    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;
    newUser.nickName = user.nickName;
    newUser.group = user.group;
    newUser.department = user.department;
    try {
      await this.userRipository.save(newUser);
      return '注册成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '注册失败';
    }
  }
  // 初始化数据
  async iniData() {
    const user1 = new User();
    (user1.username = 'qqq'),
      (user1.password = md5('qqqqqq')),
      (user1.email = 'qq.@qq.com'),
      (user1.isAdmin = true),
      (user1.nickName = 'q'),
      (user1.phoneNumber = '11111111111');

    const user2 = new User();
    (user2.username = 'www'),
      (user2.password = md5('wwwwww')),
      (user2.email = 'ww.@qq.com'),
      (user2.nickName = 'w'),
      (user2.phoneNumber = '22222222222');

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通管理员';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问ccc接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问ddd接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permission = [permission1, permission2];
    role2.permission = [permission1];

    // 只保存起始开始关联的表就可以了
    await this.userRipository.save([user1, user2]);
  }
  async login(loginUserDto: LoginUserDto, isAdmin: boolean) {
    const user = await this.userRipository.findOne({
      where: {
        username: loginUserDto.username,
        isAdmin,
      },
      // roles,和roles.permission分别是彼此关联的数据
      //这里之所以要加这个是因为这里查询的是表user，而下面用到了表role和permission
      // 当然也可以分开查询，分别把三个表都查询一遍，但是没必要
      relations: ['roles', 'roles.permission'],
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (md5(user.password) !== md5(loginUserDto.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }
    const vo = new loginUserVo();

    vo.userInfo = {
      id: user.id,
      username: user.password,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      createTime: user.createTime,
      roles: user.roles.map((item) => item.name),
      // 过reduce去处理角色对应的权限，arr是计数器，[]空数组是初值，是计数器的初值,最后返回累加器的值
      permission: user.roles.reduce((arr, item) => {
        item.permission.forEach((permission) => {
          // arr中没有permission那么就添加permission;
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    return vo;
  }
  async emailLogin(loginUserDto: EmailLoginUserDto, isAdmin: boolean) {
    const user = await this.userRipository.findOne({
      where: {
        email: loginUserDto.email,
        isAdmin,
      },
      // roles,和roles.permission分别是彼此关联的数据
      //这里之所以要加这个是因为这里查询的是表user，而下面用到了表role和permission
      // 当然也可以分开查询，分别把三个表都查询一遍，但是没必要
      relations: ['roles', 'roles.permission'],
    });
    if (!user) {
      throw new HttpException('该邮箱用户不存在', HttpStatus.BAD_REQUEST);
    }
    const captcha = this.redisService.get(
      `email_login_captcha_${loginUserDto.email}`,
    );
    if (loginUserDto.captcha !== (await captcha)) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }
    const vo = new loginUserVo();

    vo.userInfo = {
      id: user.id,
      username: user.password,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      createTime: user.createTime,
      roles: user.roles.map((item) => item.name),
      // 过reduce去处理角色对应的权限，arr是计数器，[]空数组是初值，是计数器的初值,最后返回累加器的值
      permission: user.roles.reduce((arr, item) => {
        item.permission.forEach((permission) => {
          // arr中没有permission那么就添加permission;
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    return vo;
  }
  async findUserById(userId: number, isAdmin: boolean) {
    const user = await this.userRipository.findOne({
      where: {
        id: userId,
        isAdmin,
      },
      relations: ['roles', 'roles.permission'],
    });
    return {
      email: user.email,
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permission: user.roles.reduce((arr, item) => {
        item.permission.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
  }
  async findUserDetailById(userId: number) {
    const user = await this.userRipository.findOne({
      where: {
        id: userId,
      },
    });
    return user;
  }
  async updatePassword(passwordDto: UpdatePasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${passwordDto.email}`,
    );
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    if (passwordDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }
    const foundUser = await this.userRipository.findOne({
      where: {
        username: passwordDto.username,
      },
    });
    if (foundUser.email !== passwordDto.email) {
      throw new HttpException('邮箱不正确', HttpStatus.BAD_REQUEST);
    }
    foundUser.password = md5(passwordDto.password);
    try {
      await this.userRipository.save(foundUser);
      return '密码修改成功';
    } catch (e) {
      // e是错误信息，UserService是要记录的模块或者服务
      this.logger.error(e, UserService);
      return '密码修改失败';
    }
  }
  async update(updateUserInfoDto: UpdateUserInfoDto) {
    const captcha = await this.redisService.get(
      `update_user_captcha_${updateUserInfoDto.email}`,
    );
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    if (updateUserInfoDto.captcha !== captcha) {
      throw new HttpException('验证码失效', HttpStatus.BAD_REQUEST);
    }
    const foundUser = await this.userRipository.findOneBy({
      id: updateUserInfoDto.id,
    });
    if (updateUserInfoDto.nickName) {
      foundUser.nickName = updateUserInfoDto.nickName;
    }
    if (updateUserInfoDto.headPic) {
      foundUser.headPic = updateUserInfoDto.headPic;
    }
    try {
      await this.userRipository.save(foundUser);
      return '用户修改信息成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '用户修改信息失败';
    }
  }
  async freezeUserById(id: number) {
    const user = await this.userRipository.findOneBy({
      id,
    });
    user.isFrozen = true;
    await this.userRipository.save(user);
  }
  async findUserByPage(username: string, nickName: string, email: string) {
    // 滚动过了几条数据，pageNo是当前页码，pageSize是当前页面有多少条数据

    const condition: Record<string, any> = {};
    if (username) {
      condition.username = Like(`%${username}%`);
    }
    if (nickName) {
      condition.nickName = Like(`%${nickName}%`);
    }
    if (email) {
      condition.email = Like(`%${email}%`);
    }
    const [user, totalCount] = await this.userRipository.findAndCount({
      // select要查询的数据
      select: [
        'id',
        'username',
        'nickName',
        'email',
        'phoneNumber',
        'isFrozen',
        'headPic',
        'createTime',
      ],

      where: condition,
    });
    const vo = new UserList();
    vo.users = user;
    vo.totalCount = totalCount;
    return vo;
  }
}
