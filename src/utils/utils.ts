import { BadRequestException, ParseIntPipe } from '@nestjs/common';

export function generateParseIntPipe(name: string) {
  return new ParseIntPipe({
    exceptionFactory() {
      throw new BadRequestException(name + '应该传入数字');
    },
  });
}

export function organizeObject(
  obj: Record<string, number>,
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const key in obj) {
    const [department, role] = key.split('-'); // 按照 '-' 进行分割部门和角色

    if (!result[role]) {
      result[role] = obj[key]; // 初始化角色
    } else {
      result[role] += obj[key]; // 累加值的和
    }
  }

  return result;
}
