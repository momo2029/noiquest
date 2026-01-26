import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { SessionType } from '@prisma/client';

const router = Router();

// 获取每日学习统计
router.get('/daily', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const dateStr = req.query.date as string;
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setHours(0, 0, 0, 0);

    const stats = await prisma.dailyLearningStats.findUnique({
      where: {
        userId_date: { userId, date },
      },
    });

    if (!stats) {
      res.json({
        date: date.toISOString().split('T')[0],
        totalDuration: 0,
        sessionsCount: 0,
        exercisesCount: 0,
        correctCount: 0,
        correctRate: 0,
        xpEarned: 0,
        lessonsCompleted: 0,
        reviewsCompleted: 0,
      });
      return;
    }

    res.json({
      date: date.toISOString().split('T')[0],
      totalDuration: stats.totalDuration,
      sessionsCount: stats.sessionsCount,
      exercisesCount: stats.exercisesCount,
      correctCount: stats.correctCount,
      correctRate: stats.exercisesCount > 0 ? Math.round((stats.correctCount / stats.exercisesCount) * 100) : 0,
      xpEarned: stats.xpEarned,
      lessonsCompleted: stats.lessonsCompleted,
      reviewsCompleted: stats.reviewsCompleted,
    });
  } catch (error) {
    next(error);
  }
});

// 获取每周学习报告
router.get('/weekly', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const now = new Date();

    // 计算本周开始日期（周一）
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // 获取本周每日统计
    const dailyStats = await prisma.dailyLearningStats.findMany({
      where: {
        userId,
        date: { gte: weekStart, lt: weekEnd },
      },
      orderBy: { date: 'asc' },
    });

    // 汇总数据
    const summary = {
      totalDuration: 0,
      totalExercises: 0,
      totalCorrect: 0,
      xpEarned: 0,
      lessonsCompleted: 0,
      reviewsCompleted: 0,
      streakDays: 0,
    };

    const dailyBreakdown: any[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const dayStr = day.toISOString().split('T')[0];

      const stat = dailyStats.find(s => s.date.toISOString().split('T')[0] === dayStr);

      if (stat) {
        summary.totalDuration += stat.totalDuration;
        summary.totalExercises += stat.exercisesCount;
        summary.totalCorrect += stat.correctCount;
        summary.xpEarned += stat.xpEarned;
        summary.lessonsCompleted += stat.lessonsCompleted;
        summary.reviewsCompleted += stat.reviewsCompleted;
        if (stat.exercisesCount > 0) summary.streakDays++;

        dailyBreakdown.push({
          date: dayStr,
          duration: stat.totalDuration,
          exercises: stat.exercisesCount,
          correctRate: stat.exercisesCount > 0 ? Math.round((stat.correctCount / stat.exercisesCount) * 100) : 0,
          xp: stat.xpEarned,
        });
      } else {
        dailyBreakdown.push({
          date: dayStr,
          duration: 0,
          exercises: 0,
          correctRate: 0,
          xp: 0,
        });
      }
    }

    // 获取学习时段分布
    const sessions = await prisma.learningSession.findMany({
      where: {
        userId,
        startedAt: { gte: weekStart, lt: weekEnd },
      },
    });

    const hourlyDistribution: Record<number, { sessions: number; totalDuration: number }> = {};
    for (const session of sessions) {
      const hour = session.startedAt.getHours();
      if (!hourlyDistribution[hour]) {
        hourlyDistribution[hour] = { sessions: 0, totalDuration: 0 };
      }
      hourlyDistribution[hour].sessions++;
      hourlyDistribution[hour].totalDuration += session.duration || 0;
    }

    const peakHours = Object.entries(hourlyDistribution)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        sessions: data.sessions,
        avgDuration: data.sessions > 0 ? Math.round(data.totalDuration / data.sessions) : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 3);

    // 获取上周数据进行对比
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekStats = await prisma.dailyLearningStats.findMany({
      where: {
        userId,
        date: { gte: lastWeekStart, lt: weekStart },
      },
    });

    const lastWeekSummary = lastWeekStats.reduce(
      (acc, stat) => ({
        duration: acc.duration + stat.totalDuration,
        exercises: acc.exercises + stat.exercisesCount,
        correct: acc.correct + stat.correctCount,
      }),
      { duration: 0, exercises: 0, correct: 0 }
    );

    const comparison = {
      duration: lastWeekSummary.duration > 0
        ? `${summary.totalDuration >= lastWeekSummary.duration ? '+' : ''}${Math.round(((summary.totalDuration - lastWeekSummary.duration) / lastWeekSummary.duration) * 100)}%`
        : '+100%',
      exercises: lastWeekSummary.exercises > 0
        ? `${summary.totalExercises >= lastWeekSummary.exercises ? '+' : ''}${Math.round(((summary.totalExercises - lastWeekSummary.exercises) / lastWeekSummary.exercises) * 100)}%`
        : '+100%',
      correctRate: lastWeekSummary.exercises > 0
        ? `${Math.round((summary.totalCorrect / Math.max(summary.totalExercises, 1) - lastWeekSummary.correct / lastWeekSummary.exercises) * 100)}%`
        : '0%',
    };

    res.json({
      period: `${weekStart.toISOString().split('T')[0]} - ${new Date(weekEnd.getTime() - 1).toISOString().split('T')[0]}`,
      summary: {
        ...summary,
        correctRate: summary.totalExercises > 0 ? Math.round((summary.totalCorrect / summary.totalExercises) * 100) : 0,
      },
      dailyBreakdown,
      peakHours,
      comparison,
    });
  } catch (error) {
    next(error);
  }
});

// 获取知识图谱
router.get('/knowledge-map', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    // 获取所有知识点
    const knowledgePoints = await prisma.knowledgePoint.findMany({
      orderBy: [{ category: 'asc' }, { orderIndex: 'asc' }],
    });

    // 获取用户掌握度
    const masteryRecords = await prisma.knowledgeMastery.findMany({
      where: { userId },
    });

    const masteryMap = new Map(masteryRecords.map(m => [m.knowledgeKey, m]));

    // 按分类组织
    const categories: Record<string, any> = {};

    for (const kp of knowledgePoints) {
      if (!categories[kp.category]) {
        categories[kp.category] = {
          name: kp.category,
          knowledgePoints: [],
          totalMastery: 0,
          count: 0,
        };
      }

      const mastery = masteryMap.get(kp.name);
      const masteryLevel = mastery?.masteryLevel || 0;
      const now = new Date();
      const reviewDue = mastery?.nextReviewAt ? new Date(mastery.nextReviewAt) <= now : false;

      categories[kp.category].knowledgePoints.push({
        name: kp.name,
        masteryLevel: masteryLevel / 100, // 转换为 0-1
        reviewDue,
        reviewCount: mastery?.reviewCount || 0,
        lastReviewAt: mastery?.lastReviewedAt,
      });

      categories[kp.category].totalMastery += masteryLevel;
      categories[kp.category].count++;
    }

    // 计算每个分类的平均掌握度
    const result = Object.values(categories).map((cat: any) => ({
      name: cat.name,
      masteryLevel: cat.count > 0 ? cat.totalMastery / cat.count / 100 : 0,
      knowledgePoints: cat.knowledgePoints,
    }));

    // 计算总体掌握度
    const totalMastery = result.reduce((sum, cat) => sum + cat.masteryLevel, 0);
    const overallMastery = result.length > 0 ? totalMastery / result.length : 0;

    // 找出最弱和最强的知识点
    const allPoints = result.flatMap(cat => cat.knowledgePoints);
    const sortedByMastery = [...allPoints].sort((a, b) => a.masteryLevel - b.masteryLevel);

    const weakestPoints = sortedByMastery.slice(0, 5).map(p => p.name);
    const strongestPoints = sortedByMastery.slice(-5).reverse().map(p => p.name);

    res.json({
      categories: result,
      overallMastery,
      weakestPoints,
      strongestPoints,
    });
  } catch (error) {
    next(error);
  }
});

// 获取进步趋势
router.get('/progress-trend', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const stats = await prisma.dailyLearningStats.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const trend = stats.map(stat => ({
      date: stat.date.toISOString().split('T')[0],
      xp: stat.xpEarned,
      exercises: stat.exercisesCount,
      correctRate: stat.exercisesCount > 0 ? Math.round((stat.correctCount / stat.exercisesCount) * 100) : 0,
      duration: stat.totalDuration,
    }));

    res.json({ days, trend });
  } catch (error) {
    next(error);
  }
});

// 开始学习会话
export async function startLearningSession(userId: string, sessionType: SessionType): Promise<string> {
  const session = await prisma.learningSession.create({
    data: {
      userId,
      sessionType,
      startedAt: new Date(),
    },
  });
  return session.id;
}

// 结束学习会话
export async function endLearningSession(
  sessionId: string,
  exerciseCount: number,
  correctCount: number,
  xpEarned: number
) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) return;

  const endedAt = new Date();
  const duration = Math.round((endedAt.getTime() - session.startedAt.getTime()) / 1000);

  await prisma.learningSession.update({
    where: { id: sessionId },
    data: {
      endedAt,
      duration,
      exerciseCount,
      correctCount,
      xpEarned,
    },
  });

  // 更新每日统计
  const date = new Date(session.startedAt);
  date.setHours(0, 0, 0, 0);

  await prisma.dailyLearningStats.upsert({
    where: {
      userId_date: { userId: session.userId, date },
    },
    update: {
      totalDuration: { increment: duration },
      sessionsCount: { increment: 1 },
      exercisesCount: { increment: exerciseCount },
      correctCount: { increment: correctCount },
      xpEarned: { increment: xpEarned },
      lessonsCompleted: session.sessionType === 'LESSON' ? { increment: 1 } : undefined,
      reviewsCompleted: session.sessionType === 'REVIEW' ? { increment: 1 } : undefined,
    },
    create: {
      userId: session.userId,
      date,
      totalDuration: duration,
      sessionsCount: 1,
      exercisesCount: exerciseCount,
      correctCount: correctCount,
      xpEarned: xpEarned,
      lessonsCompleted: session.sessionType === 'LESSON' ? 1 : 0,
      reviewsCompleted: session.sessionType === 'REVIEW' ? 1 : 0,
    },
  });
}

// 更新每日统计（简化版，用于单次答题）
export async function updateDailyStats(
  userId: string,
  exercisesCount: number,
  correctCount: number,
  xpEarned: number
) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  await prisma.dailyLearningStats.upsert({
    where: {
      userId_date: { userId, date },
    },
    update: {
      exercisesCount: { increment: exercisesCount },
      correctCount: { increment: correctCount },
      xpEarned: { increment: xpEarned },
    },
    create: {
      userId,
      date,
      exercisesCount,
      correctCount,
      xpEarned,
    },
  });
}

export const analyticsRouter = router;
