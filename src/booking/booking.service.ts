import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Between, EntityManager } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { Booking } from './entities/booking.entity';
import { Like } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { organizeObject } from '../utils/utils';
import { from } from 'rxjs';

@Injectable()
export class BookingService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  async initData() {
    const user1 = await this.entityManager.findOneBy(User, {
      id: 1,
    });
    const user2 = await this.entityManager.findOneBy(User, {
      id: 2,
    });
    const room1 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 3,
    });
    const room2 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 6,
    });
    const booking1 = new Booking();
    booking1.room = room1;
    booking1.user = user1;
    booking1.startTime = new Date();
    booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);
    await this.entityManager.save(Booking, booking1);

    const booking2 = new Booking();
    booking2.room = room2;
    booking2.user = user2;
    booking2.startTime = new Date();
    booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);
    await this.entityManager.save(Booking, booking2);

    const booking3 = new Booking();
    booking3.room = room1;
    booking3.user = user2;
    booking3.startTime = new Date();
    booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);
    await this.entityManager.save(Booking, booking3);

    const booking4 = new Booking();
    booking4.room = room2;
    booking4.user = user1;
    booking4.startTime = new Date();
    booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);
    await this.entityManager.save(Booking, booking4);
  }

  async find(
    username: string,
    meetingRoomName: string,
    meetingRoomPosition: string,
    bookingStartTimg: string,
    bookingTimeEnd: string,
  ) {
    const condition: Record<string, any> = {};

    if (username) {
      condition.user = {
        username: Like(`%${username}%`),
      };
    }
    if (meetingRoomName) {
      condition.room = {
        name: Like(`%${meetingRoomName}%`),
      };
    }
    if (meetingRoomPosition) {
      if (!condition) {
        condition.room = {};
      }
      condition.room.location = Like(`%${meetingRoomPosition}%`);
    }
    if (bookingStartTimg) {
      if (!bookingTimeEnd) {
        bookingTimeEnd = bookingTimeEnd + 60 * 60 * 1000;
      }
      condition.startTime = Between(
        new Date(bookingStartTimg),
        new Date(bookingTimeEnd),
      );
    }

    const [bookings, totalCount] = await this.entityManager.findAndCount(
      Booking,
      {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,
          createTime: true,
          note: true,
          user: {
            id: true,
            nickName: true,
            department: true,
            group: true,
          },
        },
        where: condition,
        relations: {
          user: true,
          room: true,
        },
      },
    );
    return {
      bookings: bookings.map((item) => {
        delete item.user.password;
        return item;
      }),
      totalCount,
    };
  }

  async apply(id: number) {
    await this.entityManager.update(
      Booking,
      {
        id,
      },
      {
        status: '审批通过',
      },
    );
    return 'success';
  }

  async reject(id: number) {
    await this.entityManager.update(
      Booking,
      {
        id,
      },
      {
        status: '审批驳回',
      },
    );
    return 'success';
  }

  async unbind(id: number) {
    await this.entityManager.update(Booking, { id }, { status: '已解除' });
    return 'success';
  }

  async urge(id: number) {
    const flag = await this.redisService.get(`urge_${id}`);

    if (flag) {
      return '半小时只能催办一次，请耐心等待';
    }
    let email = await this.redisService.get('admin_email');

    if (!email) {
      const admin = await this.entityManager.findOne(User, {
        select: {
          email: true,
        },
        where: {
          isAdmin: true,
        },
      });
      email = admin.email;
      // this.emailService.sendMail({
      //   to: email,
      //   subject: '预定申请代办提醒',
      //   html: `id为￥{id}的预定申请正在等待审批`,
      // });

      // this.redisService.set(`urge_${id}`, 1, 60 * 30);
      const code = Math.random().toString().slice(2, 8);
      this.redisService.set(`update_user_captcha_${email}`, code, 10 * 60);
    }
  }

  async history(time: string, department: string) {
    let data = {};

    const condition: Record<string, any> = {};
    if (time === 'week') {
      // 获取当前日期
      const today = new Date();

      // 获取当前星期几（0 表示星期日，1 表示星期一，依此类推）
      const currentDayOfWeek = today.getDay();

      // 获取当前日期的时间戳（毫秒）
      const currentTimestamp = today.getTime();

      // 计算上一个星期一的时间戳
      const previousMondayTimestamp =
        currentTimestamp -
        (currentDayOfWeek - 1) * 24 * 60 * 60 * 1000 -
        7 * 24 * 60 * 60 * 1000;

      // 计算上一个星期日的时间戳
      const previousSundayTimestamp =
        currentTimestamp - currentDayOfWeek * 24 * 60 * 60 * 1000;

      if (department !== '全部') {
        condition.user.department = department;
      }

      condition.startTime = Between(
        new Date(previousMondayTimestamp),
        new Date(previousSundayTimestamp),
      );
      const [bookings] = await this.entityManager.findAndCount(Booking, {
        select: {
          status: true,
          note: true,
          user: {
            nickName: true,
            department: true,
            group: true,
          },
        },
        relations: {
          user: true,
        },
        where: condition,
      });

      if (department !== '全部') {
        const obj = bookings.reduce((accumulator, currentValue) => {
          if (currentValue.status === '审批通过') {
            const property = currentValue.user.group;
            accumulator[property] = (accumulator[property] || 0) + 1;
          }
          return accumulator;
        }, {});

        data = obj;
      } else {
        data = bookings.reduce((accumulator, currentValue) => {
          if (currentValue.status === '审批通过') {
            const property = currentValue.user.department;
            accumulator[property] = (accumulator[property] || 0) + 1;
          }
          return accumulator;
        }, {});
      }
    } else if (time === 'month') {
      const today = new Date();

      // 设置日期为当前月份的第一天
      today.setDate(1);

      // 减去一天，得到上一个月最后一天的日期
      today.setDate(0);

      // 获取上一个月最后一天的时间
      const previousMonthLastDay = today.getTime();

      // 设置日期为当前月份的第一天
      today.setDate(1);

      // 获取上一个月第一天的时间
      const previousMonthFirstDay = today.getTime();

      // 根据时间戳创建上一个月第一天的日期对象
      const previousMonthFirstDate = new Date(previousMonthFirstDay);

      // 根据时间戳创建上一个月最后一天的日期对象
      const previousMonthLastDate = new Date(previousMonthLastDay);

      if (department !== '全部') {
        condition.user = { department: department };
      }
      condition.startTime = Between(
        new Date(previousMonthFirstDate),
        new Date(previousMonthLastDate),
      );
      const [bookings] = await this.entityManager.findAndCount(Booking, {
        select: {
          status: true,
          note: true,
          user: {
            nickName: true,
            department: true,
            group: true,
          },
        },
        relations: {
          user: true,
        },
        where: condition,
      });
      if (department !== '全部') {
        const obj = bookings.reduce((accumulator, currentValue) => {
          if (currentValue.status === '审批通过') {
            const property = currentValue.user.group;
            accumulator[property] = (accumulator[property] || 0) + 1;
          }
          return accumulator;
        }, {});

        data = obj;
      } else {
        data = bookings.reduce((accumulator, currentValue) => {
          if (currentValue.status === '审批通过') {
            const property = currentValue.user.department;
            accumulator[property] = (accumulator[property] || 0) + 1;
          }
          return accumulator;
        }, {});
      }
    } else if (time === 'year') {
      const today = new Date();

      // 获取当前年份
      const currentYear = today.getFullYear();

      // 获取上一年的第一个月份的时间
      const previousYearFirstMonthTime = new Date(currentYear - 1, 0).getTime();

      // 获取上一年的最后一个月份的时间
      const previousYearLastMonthTime = new Date(currentYear - 1, 11).getTime();

      // 根据时间戳创建上一年的第一个月份的日期对象
      const previousYearFirstMonthDate = new Date(previousYearFirstMonthTime);

      // 根据时间戳创建上一年的最后一个月份的日期对象
      const previousYearLastMonthDate = new Date(previousYearLastMonthTime);

      if (department !== '全部') {
        condition.user = { department: department };
      }

      condition.startTime = Between(
        new Date(previousYearFirstMonthDate),
        new Date(previousYearLastMonthDate),
      );
      const [bookings] = await this.entityManager.findAndCount(Booking, {
        select: {
          status: true,
          note: true,
          user: {
            nickName: true,
            department: true,
            group: true,
          },
        },
        relations: {
          user: true,
          room: true,
        },
        where: condition,
      });

      if (department !== '全部') {
        const obj = bookings.reduce((accumulator, currentValue) => {
          if (currentValue.status === '审批通过') {
            const property = currentValue.user.group;
            accumulator[property] = (accumulator[property] || 0) + 1;
          }
          return accumulator;
        }, {});

        data = obj;
      } else {
        data = bookings.reduce((accumulator, currentValue) => {
          if (currentValue.status === '审批通过') {
            const property = currentValue.user.department;
            accumulator[property] = (accumulator[property] || 0) + 1;
          }
          return accumulator;
        }, {});
      }
    }

    return data;
  }
  async getAllDepartments() {
    const allDepartment = [];
    const departmentResult = await this.entityManager.findAndCount(User, {
      select: {
        department: true,
      },
    });
    departmentResult[0].map((item) => {
      if (!allDepartment.includes(item.department)) {
        allDepartment.push(item.department);
      }
    });
    return allDepartment;
  }

  async getWord(department: string) {
    let word = {};
    const condition: Record<string, any> = {};

    const today = new Date();

    // 获取当前年份
    const currentYear = today.getFullYear();

    // 获取上一年的第一个月份的时间
    const previousYearFirstMonthTime = new Date(currentYear - 1, 0).getTime();

    // 获取上一年的最后一个月份的时间
    const previousYearLastMonthTime = new Date(currentYear - 1, 11).getTime();

    // 根据时间戳创建上一年的第一个月份的日期对象
    const previousYearFirstMonthDate = new Date(previousYearFirstMonthTime);

    // 根据时间戳创建上一年的最后一个月份的日期对象
    const previousYearLastMonthDate = new Date(previousYearLastMonthTime);

    if (department !== '全部') {
      condition.user.department = department;
    }

    condition.startTime = Between(
      new Date(previousYearFirstMonthDate),
      new Date(previousYearLastMonthDate),
    );
    const [bookings] = await this.entityManager.findAndCount(Booking, {
      select: {
        status: true,
        note: true,
        user: {
          nickName: true,
          department: true,
          group: true,
        },
      },
      relations: {
        user: true,
        room: true,
      },
      where: condition,
    });

    word = bookings.reduce((accumulator, currentValue) => {
      if (currentValue.status === '审批通过') {
        const property = currentValue.note;
        accumulator[property] = (accumulator[property] || 0) + 1;
      }
      return accumulator;
    }, {});

    return word;
  }
}
