import prisma from '../config/database.js';

/**
 * 更新用户连续学习天数
 * 调用时机：用户完成课时或练习题时
 */
export async function updateUserStreak(userId: string): Promise<{ streak: number; updated: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastStudyDate: true },
  });

  if (!user) {
    return { streak: 0, updated: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
  
  // 当 lastStudyDate 为空时，检查最近的学习记录
  if (!lastStudy) {
    const recentProgress = await prisma.exerciseProgress.findFirst({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true }
    });
    
    if (recentProgress) {
      lastStudy = new Date(recentProgress.completedAt);
      lastStudy.setHours(0, 0, 0, 0);
    }
  } else {
    lastStudy.setHours(0, 0, 0, 0);
  }

  // 今天已经学习过，不需要更新
  if (lastStudy && lastStudy.getTime() === today.getTime()) {
    return { streak: user.streak, updated: false };
  }

  let newStreak = user.streak;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastStudy && lastStudy.getTime() === yesterday.getTime()) {
    // 昨天学习过，连续天数 +1
    newStreak = user.streak + 1;
  } else if (lastStudy) {
    // 检查是否连续学习
    const daysSinceLastStudy = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastStudy === 0) {
      // 同一天学习，不增加 streak
      newStreak = user.streak;
    } else if (daysSinceLastStudy === 1) {
      // 昨天学习过，连续天数 +1
      newStreak = user.streak + 1;
    } else {
      // 中断了，重新开始
      newStreak = 1;
    }
  } else {
    // 从未学习过，重新开始
    newStreak = 1;
  }

  // 更新数据库
  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: newStreak,
      lastStudyDate: new Date(),
    },
  });

  return { streak: newStreak, updated: true };
}
