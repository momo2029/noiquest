import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * 创建测试用户
 */
export async function createTestUser(data?: {
  username?: string;
  email?: string;
  password?: string;
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
}) {
  const timestamp = Date.now();
  const hashedPassword = await bcrypt.hash(data?.password || 'test123456', 10);

  return prisma.user.create({
    data: {
      username: data?.username || `testuser_${timestamp}`,
      email: data?.email || `test_${timestamp}@test.com`,
      password: hashedPassword,
      name: 'Test User',
      role: data?.role || 'STUDENT',
    },
  });
}

/**
 * 删除测试用户
 */
export async function deleteTestUser(userId: string) {
  return prisma.user.delete({
    where: { id: userId },
  });
}

/**
 * 清理所有测试数据（以 test_ 开头的用户）
 */
export async function cleanupTestData() {
  await prisma.user.deleteMany({
    where: {
      OR: [
        { username: { startsWith: 'testuser_' } },
        { email: { startsWith: 'test_' } },
      ],
    },
  });
}

/**
 * 获取 Prisma 客户端实例
 */
export function getPrisma() {
  return prisma;
}

export { prisma };
