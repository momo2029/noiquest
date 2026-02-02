import { beforeAll, afterAll, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

// 测试用 Prisma 客户端
export const prisma = new PrismaClient();

beforeAll(async () => {
  // 测试开始前的全局设置
  console.log('🧪 测试环境初始化...');
});

afterEach(async () => {
  // 每个测试后清理（可选）
});

afterAll(async () => {
  // 测试结束后断开数据库连接
  await prisma.$disconnect();
  console.log('🧪 测试环境清理完成');
});
