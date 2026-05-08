import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  try {
    // 查询用户总数
    const userCount = await prisma.user.count();
    console.log(`总用户数: ${userCount}`);

    if (userCount > 0) {
      // 查询前10个用户的基本信息
      const users = await prisma.user.findMany({
        take: Math.min(10, userCount),
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log('\n最新用户样本:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   邮箱: ${user.email || '无'}`);
        console.log(`   用户名: ${user.username || '无'}`);
        console.log(`   角色: ${user.role}`);
        console.log(`   创建时间: ${user.createdAt}`);
        console.log('');
      });
    } else {
      console.log('数据库中没有用户记录');
    }

    // 查询其他重要数据
    const skillCount = await prisma.skill.count();
    const courseCount = await prisma.course.count();
    const questionCount = await prisma.question.count();

    console.log(`\n技能树知识点: ${skillCount} 个`);
    console.log(`课程数量: ${courseCount} 门`);
    console.log(`题目数量: ${questionCount} 题`);

  } catch (error) {
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
      console.error('❌ 数据库表不存在，需要运行迁移');
    } else {
      console.error('❌ 查询错误:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);