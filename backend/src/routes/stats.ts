import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// 获取学生统计数据
router.get('/student', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    // 获取完成的练习数
    const completedCount = await prisma.exerciseProgress.count({
      where: { userId, completed: true },
    });

    // 获取总练习数
    const totalExercises = await prisma.exercise.count();

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        totalXp: true,
        streak: true,
        hearts: true,
        gems: true,
      },
    });

    // 按难度统计
    const difficultyStats = await prisma.exercise.groupBy({
      by: ['difficulty'],
      _count: true,
    });

    const completedByDifficulty = await prisma.exerciseProgress.findMany({
      where: { userId, completed: true },
      include: { exercise: { select: { difficulty: true } } },
    });

    const difficultyProgress = difficultyStats.map(d => ({
      difficulty: d.difficulty,
      total: d._count,
      completed: completedByDifficulty.filter(p => p.exercise.difficulty === d.difficulty).length,
    }));

    // 按分类统计
    const categoryStats = await prisma.exercise.groupBy({
      by: ['category'],
      _count: true,
    });

    const completedByCategory = await prisma.exerciseProgress.findMany({
      where: { userId, completed: true },
      include: { exercise: { select: { category: true } } },
    });

    const categoryProgress = categoryStats.map(c => ({
      category: c.category,
      total: c._count,
      completed: completedByCategory.filter(p => p.exercise.category === c.category).length,
    }));

    res.json({
      user,
      progress: {
        completed: completedCount,
        total: totalExercises,
        percentage: Math.round((completedCount / totalExercises) * 100),
      },
      difficultyProgress,
      categoryProgress,
    });
  } catch (error) {
    next(error);
  }
});

// 获取教师仪表盘数据
router.get('/teacher', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const teacherId = req.user!.id;

    // 获取班级数
    const classCount = await prisma.class.count({
      where: { teacherId },
    });

    // 获取学生总数
    const classes = await prisma.class.findMany({
      where: { teacherId },
      select: { id: true },
    });
    const classIds = classes.map(c => c.id);

    const studentCount = await prisma.user.count({
      where: { classId: { in: classIds } },
    });

    // 获取作业数
    const homeworkCount = await prisma.homework.count({
      where: { teacherId },
    });

    // 获取学生排行榜
    const topStudents = await prisma.user.findMany({
      where: { classId: { in: classIds } },
      select: {
        id: true,
        name: true,
        avatar: true,
        level: true,
        totalXp: true,
        streak: true,
        _count: {
          select: { progress: { where: { completed: true } } },
        },
      },
      orderBy: { totalXp: 'desc' },
      take: 10,
    });

    // 获取最近活跃学生
    const recentActive = await prisma.user.findMany({
      where: {
        classId: { in: classIds },
        lastStudyDate: { not: null },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        lastStudyDate: true,
        streak: true,
      },
      orderBy: { lastStudyDate: 'desc' },
      take: 5,
    });

    res.json({
      overview: {
        classCount,
        studentCount,
        homeworkCount,
      },
      topStudents,
      recentActive,
    });
  } catch (error) {
    next(error);
  }
});

// 获取排行榜
router.get('/leaderboard', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { classId, limit = 20 } = req.query;

    const leaderboard = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        ...(classId && { classId: classId as string }),
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        level: true,
        totalXp: true,
        streak: true,
      },
      orderBy: { totalXp: 'desc' },
      take: Number(limit),
    });

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

export { router as statsRouter };
