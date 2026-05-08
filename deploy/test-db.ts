import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking database tables...');

    // 检查用户表
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);

    if (userCount > 0) {
      const users = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true
        }
      });
      console.log('Sample users:', JSON.stringify(users, null, 2));
    }

    // 检查技能树
    const skillCount = await prisma.skill.count();
    console.log(`Skill count: ${skillCount}`);

    // 检查题目
    const questionCount = await prisma.question.count();
    console.log(`Question count: ${questionCount}`);

  } catch (error) {
    console.error('Database error:', error.message);
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('❌ Tables do not exist yet - need to run migrations');
    } else {
      console.log('❌ Other database error');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });