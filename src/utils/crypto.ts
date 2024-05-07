import * as crypto from 'crypto';

// 对密码进行加密
export function md5(str: string) {
  // 创建一个MD5哈希对象
  const hash = crypto.createHash('md5');
  // 对传入的字符串进行加密
  hash.update(str);
  //将哈希结果转化成十六进制字符
  return hash.digest('hex');
}
