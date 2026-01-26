import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// 获取单题统计
router.get('/exercises/:id/statistics', authenticate, requireRole('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const exerciseId = req.params.id;

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: { id: true, title: true, type: true, difficulty: true },
    });

    if (!exercise) {
      res.status(404).json({ error: '题目不存在' });
      return;
    }

    let stats = await prisma.exerciseStatistics.findUnique({
      where: { exerciseId },
    });

    // 如果没有统计数据，返回空数据
    if (!stats) {
      stats = {
        id: '',
        exerciseId,
        totalAttempts: 0,
        correctFirst: 0,
        totalCorrect: 0,
        uniqueUsers: 0,
        totalTimeSeconds: 0,
        skippedCount: 0,
        commonMistakes: null,
        updatedAt: new Date(),
      };
    }

    const correctRate = stats.totalAttempts > 0 ? stats.correctFirst / stats.totalAttempts : 0;
    const avgAttempts = stats.uniqueUsers > 0 ? stats.totalAttempts / stats.uniqueUsers : 0;
    const avgTimeSeconds = stats.totalAttempts > 0 ? stats.totalTimeSeconds / stats.totalAttempts : 0;
    const abandonRate = stats.totalAttempts > 0 ? stats.skippedCount / (stats.totalAttempts + stats.skippedCount) : 0;

    // 获取最近7天的趋势
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentProgress = await prisma.exerciseProgress.findMany({
      where: {
        exerciseId,
        completedAt: { gte: sevenDaysAgo },
      },
      select: { completedAt: true, completed: true },
    });

    // 按日期分组
    const trendMap: Record<string, { attempts: number; correct: number }> = {};
    for (const p of recentProgress) {
      if (!p.completedAt) continue;
      const dateStr = p.completedAt.toISOString().split('T')[0];
      if (!trendMap[dateStr]) {
        trendMap[dateStr] = { attempts: 0, correct: 0 };
      }
      trendMap[dateStr].attempts++;
      if (p.completed) trendMap[dateStr].correct++;
    }

    const trend = Object.entries(trendMap)
      .map(([date, data]) => ({
        date,
        attempts: data.attempts,
        correctRate: data.attempts > 0 ? data.correct / data.attempts : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      exerciseId,
      title: exercise.title,
      type: exercise.type,
      difficulty: exercise.difficulty,
      statistics: {
        correctRate,
        avgAttempts,
        avgTimeSeconds,
        abandonRate,
        totalAttempts: stats.totalAttempts,
        uniqueUsers: stats.uniqueUsers,
      },
      commonMistakes: stats.commonMistakes || [],
      trend,
    });
  } catch (error) {
    next(error);
  }
});

// 获取总览统计
router.get('/overview', authenticate, requireRole('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response, next) => {
  try {
    // 总题目数
    const totalExercises = await prisma.exercise.count({
      where: { isPublished: true },
    });

    // 总答题次数
    const totalAttempts = await prisma.exerciseProgress.count();

    // 总用户数
    const totalUsers = await prisma.user.count({
      where: { role: 'STUDENT' },
    });

    // 活跃用户（最近7天有学习记录）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await prisma.user.count({
      where: {
        role: 'STUDENT',
        lastStudyDate: { gte: sevenDaysAgo },
      },
    });

    // 平均正确率
    const allStats = await prisma.exerciseStatistics.aggregate({
      _sum: {
        totalAttempts: true,
        correctFirst: true,
      },
    });

    const avgCorrectRate = allStats._sum.totalAttempts && allStats._sum.totalAttempts > 0
      ? (allStats._sum.correctFirst || 0) / allStats._sum.totalAttempts
      : 0;

    // 今日统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await prisma.dailyLearningStats.aggregate({
      where: { date: { gte: today } },
      _sum: {
        exercisesCount: true,
        xpEarned: true,
      },
      _count: true,
    });

    res.json({
      totalExercises,
      totalAttempts,
      totalUsers,
      activeUsers,
      avgCorrectRate,
      today: {
        exercisesCompleted: todayStats._sum.exercisesCount || 0,
        xpEarned: todayStats._sum.xpEarned || 0,
        activeUsers: todayStats._count,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取难题排行（正确率最低）
router.get('/difficult', authenticate, requireRole('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const stats = await prisma.exerciseStatistics.findMany({
      where: {
        totalAttempts: { gte: 10 }, // 至少10次尝试才有统计意义
      },
      include: {
        exercise: {
          select: { id: true, title: true, type: true, difficulty: true, category: true },
        },
      },
    });

    // 计算正确率并排序
    const withRate = stats.map(s => ({
      ...s,
      correctRate: s.totalAttempts > 0 ? s.correctFirst / s.totalAttempts : 0,
    }));

    const sorted = withRate
      .sort((a, b) => a.correctRate - b.correctRate)
      .slice(0, limit);

    res.json(sorted.map(s => ({
      exerciseId: s.exerciseId,
      title: s.exercise.title,
      type: s.exercise.type,
      difficulty: s.exercise.difficulty,
      category: s.exercise.category,
      correctRate: s.correctRate,
      totalAttempts: s.totalAttempts,
      uniqueUsers: s.uniqueUsers,
    })));
  } catch (error) {
    next(error);
  }
});

// 获取热门题目（答题次数最多）
router.get('/popular', authenticate, requireRole('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const stats = await prisma.exerciseStatistics.findMany({
      orderBy: { totalAttempts: 'desc' },
      take: limit,
      include: {
        exercise: {
          select: { id: true, title: true, type: true, difficulty: true, category: true },
        },
      },
    });

    res.json(stats.map(s => ({
      exerciseId: s.exerciseId,
      title: s.exercise.title,
      type: s.exercise.type,
      difficulty: s.exercise.difficulty,
      category: s.exercise.category,
      totalAttempts: s.totalAttempts,
      uniqueUsers: s.uniqueUsers,
      correctRate: s.totalAttempts > 0 ? s.correctFirst / s.totalAttempts : 0,
    })));
  } catch (error) {
    next(error);
  }
});

// 更新题目统计（内部调用）
export async function updateExerciseStatistics(
  exerciseId: string,
  userId: string,
  correct: boolean,
  isFirstAttempt: boolean,
  timeSeconds: number,
  userAnswer?: any
) {
  // 检查是否是该用户第一次尝试这道题
  const existingProgress = await prisma.exerciseProgress.findUnique({
    where: {
      userId_exerciseId: { userId, exerciseId },
    },
  });

  const isNewUser = !existingProgress;

  await prisma.exerciseStatistics.upsert({
    where: { exerciseId },
    update: {
      totalAttempts: { increment: 1 },
      correctFirst: isFirstAttempt && correct ? { increment: 1 } : undefined,
      totalCorrect: correct ? { increment: 1 } : undefined,
      uniqueUsers: isNewUser ? { increment: 1 } : undefined,
      totalTimeSeconds: { increment: timeSeconds },
    },
    create: {
      exerciseId,
      totalAttempts: 1,
      correctFirst: isFirstAttempt && correct ? 1 : 0,
      totalCorrect: correct ? 1 : 0,
      uniqueUsers: 1,
      totalTimeSeconds: timeSeconds,
    },
  });

  // 如果答错，记录常见错误
  if (!correct && userAnswer) {
    const stats = await prisma.exerciseStatistics.findUnique({
      where: { exerciseId },
    });

    if (stats) {
      const commonMistakes = (stats.commonMistakes as any[]) || [];
      const answerStr = JSON.stringify(userAnswer);

      const existingMistake = commonMistakes.find(m => JSON.stringify(m.answer) === answerStr);
      if (existingMistake) {
        existingMistake.count++;
      } else {
        commonMistakes.push({ answer: userAnswer, count: 1 });
      }

      // 只保留前10个最常见的错误
      commonMistakes.sort((a, b) => b.count - a.count);
      const topMistakes = commonMistakes.slice(0, 10);

      await prisma.exerciseStatistics.update({
        where: { exerciseId },
        data: { commonMistakes: topMistakes },
      });
    }
  }
}

export const adminStatisticsRouter = router;
