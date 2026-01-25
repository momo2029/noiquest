const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // 检查管理员是否已存在
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (existingAdmin) {
      console.log('管理员账户已存在：');
      console.log(`  邮箱: ${existingAdmin.email}`);
      console.log(`  用户名: ${existingAdmin.username}`);
      process.exit(0);
    }

    // 创建管理员账户
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@28920.com',
        password: await bcrypt.hash('admin123', 10),
        name: '系统管理员',
        avatar: '👑',
        role: 'ADMIN',
        level: 99,
        xp: 99999,
        totalXp: 99999,
        gems: 9999
      }
    });

    console.log('✅ 管理员账户创建成功！');
    console.log('');
    console.log('登录信息：');
    console.log(`  邮箱: ${admin.email}`);
    console.log(`  用户名: ${admin.username}`);
    console.log(`  密码: admin123`);
    console.log('');
    console.log('⚠️  请尽快修改默认密码！');

  } catch (error) {
    console.error('❌ 创建管理员账户失败：', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
