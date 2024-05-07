import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;
  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      // 要连接到的主机名或IP地址
      host: this.configService.get('nodemailer_host'),
      port: this.configService.get('nodemailer_port'),
      // 连接到TLS则为true，默认为false,大多数情况下，如果要连接到端口456就设置为true，否则就是false（连接到端口587或25）
      secure: false,
      // 定义身份验证的数据
      auth: {
        user: this.configService.get('nodemailer_user'),
        pass: this.configService.get('nodemailer_pass'),
      },
    });
    // this.transporter.verify(function (error, success) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log('email is ready');
    //   }
    // });
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      // 地址字符串
      from: {
        name: '会议室预定系统',
        address: '会议室系统',
      },
      // 收件人地址
      to,
      subject,
      // 发件内容
      html,
    });
  }
}
