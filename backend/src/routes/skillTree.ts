import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 获取技能树结构和用户进度
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    // 获取所有技能单元
    const units = await prisma.skillUnit.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          include: {
            exercises: {
              select: { id: true, title: true, type: true, xp: true },
            },
          },
        },
        prerequisite: {
          select: { id: true, title: true },
        },
      },
    });

    // 获取用户进度
    const userUnitProgress = await prisma.userUnitProgress.findMany({
      where: { userId },
    });

    const userLessonProgress = await prisma.userLessonProgress.findMany({
      where: { userId },
    });

    // 获取用户总 XP
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true },
    });

    // 合并数据
    const skillTree = units.map(unit => {
      const unitProgress = userUnitProgress.find(p => p.unitId === unit.id);
      const isUnlocked = !unit.prerequisiteId ||
        userUnitProgress.some(p => p.unitId === unit.prerequisiteId && p.completed) ||
        (user?.totalXp || 0) >= unit.requiredXp;

      const lessonsWithProgress = unit.lessons.map(lesson => {
        const lessonProgress = userLessonProgress.find(p => p.lessonId === lesson.id);
        return {
          ...lesson,
          completed: lessonProgress?.completed || false,
          mistakes: lessonProgress?.mistakes || 0,
          perfectRun: lessonProgress?.perfectRun || false,
        };
      });

      return {
        ...unit,
        lessons: lessonsWithProgress,
        unlocked: unitProgress?.unlocked || isUnlocked,
        completed: unitProgress?.completed || false,
        lessonsCompleted: unitProgress?.lessonsCompleted || 0,
        crownLevel: unitProgress?.crownLevel || 0,
      };
    });

    res.json({
      skillTree,
      userTotalXp: user?.totalXp || 0,
    });
  } catch (error) {
    next(error);
  }
});

// 获取单元详情
router.get('/units/:unitId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { unitId } = req.params;
    const userId = req.user!.id;

    const unit = await prisma.skillUnit.findUnique({
      where: { id: unitId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          include: {
            exercises: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                xp: true,
                difficulty: true,
              },
            },
          },
        },
        prerequisite: true,
      },
    });

    if (!unit) {
      return res.status(404).json({ error: '单元不存在' });
    }

    // 获取用户进度
    const unitProgress = await prisma.userUnitProgress.findUnique({
      where: { userId_unitId: { userId, unitId } },
    });

    const lessonProgressList = await prisma.userLessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: unit.lessons.map(l => l.id) },
      },
    });

    const lessonsWithProgress = unit.lessons.map(lesson => {
      const progress = lessonProgressList.find(p => p.lessonId === lesson.id);
      return {
        ...lesson,
        completed: progress?.completed || false,
        mistakes: progress?.mistakes || 0,
        perfectRun: progress?.perfectRun || false,
      };
    });

    res.json({
      ...unit,
      lessons: lessonsWithProgress,
      unlocked: unitProgress?.unlocked || false,
      completed: unitProgress?.completed || false,
      lessonsCompleted: unitProgress?.lessonsCompleted || 0,
      crownLevel: unitProgress?.crownLevel || 0,
    });
  } catch (error) {
    next(error);
  }
});

// 获取课程详情
router.get('/lessons/:lessonId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user!.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        unit: {
          select: { id: true, title: true, icon: true },
        },
        exercises: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: '课程不存在' });
    }

    // 获取用户课程进度
    const lessonProgress = await prisma.userLessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    // 获取用户练习进度
    const exerciseProgress = await prisma.exerciseProgress.findMany({
      where: {
        userId,
        exerciseId: { in: lesson.exercises.map(e => e.id) },
      },
    });

    const exercisesWithProgress = lesson.exercises.map(exercise => {
      const progress = exerciseProgress.find(p => p.exerciseId === exercise.id);
      return {
        ...exercise,
        completed: progress?.completed || false,
      };
    });

    res.json({
      ...lesson,
      exercises: exercisesWithProgress,
      completed: lessonProgress?.completed || false,
      mistakes: lessonProgress?.mistakes || 0,
      perfectRun: lessonProgress?.perfectRun || false,
    });
  } catch (error) {
    next(error);
  }
});

// 开始课程
router.post('/lessons/:lessonId/start', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user!.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        exercises: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: '课程不存在' });
    }

    // 创建或更新课程进度
    await prisma.userLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { mistakes: 0 },
      create: {
        userId,
        lessonId,
        completed: false,
        mistakes: 0,
        perfectRun: false,
      },
    });

    // 确保单元进度存在
    await prisma.userUnitProgress.upsert({
      where: { userId_unitId: { userId, unitId: lesson.unitId } },
      update: { unlocked: true },
      create: {
        userId,
        unitId: lesson.unitId,
        unlocked: true,
        completed: false,
        lessonsCompleted: 0,
        crownLevel: 0,
      },
    });

    res.json({
      message: '课程已开始',
      exercises: lesson.exercises,
    });
  } catch (error) {
    next(error);
  }
});

// 完成课程
router.post('/lessons/:lessonId/complete', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { lessonId } = req.params;
    const { mistakes = 0 } = req.body;
    const userId = req.user!.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        unit: true,
        exercises: true,
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: '课程不存在' });
    }

    const perfectRun = mistakes === 0;

    // 更新课程进度
    await prisma.userLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        completed: true,
        mistakes,
        perfectRun,
      },
      create: {
        userId,
        lessonId,
        completed: true,
        mistakes,
        perfectRun,
      },
    });

    // 计算单元完成的课程数
    const completedLessons = await prisma.userLessonProgress.count({
      where: {
        userId,
        lesson: { unitId: lesson.unitId },
        completed: true,
      },
    });

    const totalLessons = await prisma.lesson.count({
      where: { unitId: lesson.unitId },
    });

    const unitCompleted = completedLessons >= totalLessons;

    // 更新单元进度
    const unitProgress = await prisma.userUnitProgress.upsert({
      where: { userId_unitId: { userId, unitId: lesson.unitId } },
      update: {
        lessonsCompleted: completedLessons,
        completed: unitCompleted,
        crownLevel: unitCompleted ? { increment: 1 } : undefined,
      },
      create: {
        userId,
        unitId: lesson.unitId,
        unlocked: true,
        completed: unitCompleted,
        lessonsCompleted: completedLessons,
        crownLevel: unitCompleted ? 1 : 0,
      },
    });

    // 计算获得的 XP
    const xpEarned = lesson.exercises.reduce((sum, e) => sum + e.xp, 0);
    const bonusXp = perfectRun ? Math.floor(xpEarned * 0.2) : 0;
    const totalXp = xpEarned + bonusXp;

    // 更新用户 XP
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: totalXp },
        totalXp: { increment: totalXp },
      },
    });

    // 更新每日 XP 记录
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyXpRecord.upsert({
      where: { userId_date: { userId, date: today } },
      update: { xpEarned: { increment: totalXp } },
      create: {
        userId,
        date: today,
        xpEarned: totalXp,
        goalMet: false,
      },
    });

    // 解锁下一个单元（如果当前单元完成）
    if (unitCompleted) {
      const nextUnit = await prisma.skillUnit.findFirst({
        where: { prerequisiteId: lesson.unitId },
      });

      if (nextUnit) {
        await prisma.userUnitProgress.upsert({
          where: { userId_unitId: { userId, unitId: nextUnit.id } },
          update: { unlocked: true },
          create: {
            userId,
            unitId: nextUnit.id,
            unlocked: true,
            completed: false,
            lessonsCompleted: 0,
            crownLevel: 0,
          },
        });
      }
    }

    res.json({
      message: '课程完成',
      xpEarned: totalXp,
      bonusXp,
      perfectRun,
      unitCompleted,
      lessonsCompleted: completedLessons,
      totalLessons,
      crownLevel: unitProgress.crownLevel,
    });
  } catch (error) {
    next(error);
  }
});

export { router as skillTreeRouter };
