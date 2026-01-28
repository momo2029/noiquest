import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { Tier } from '@prisma/client';

const router = Router();

// 梯队配置
const TIER_CONFIG = {
  CSP_J: { name: '入门篇', color: '#22c55e', order: 1, unlockRate: 0 },
  CSP_S: { name: '进阶篇', color: '#3b82f6', order: 2, unlockRate: 80 },
  PROVINCIAL: { name: '省选/NOI', color: '#a855f7', order: 3, unlockRate: 80 },
  IOI: { name: '大师篇', color: '#ef4444', order: 4, unlockRate: 80 },
};

// 获取模块的课程列表
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { tier, moduleId } = req.query;

    // 构建查询条件
    const whereClause: any = { isPublished: true };
    if (tier) {
      whereClause.tier = tier as Tier;
    }
    if (moduleId) {
      whereClause.moduleId = parseInt(moduleId as string);
    }

    // 获取课程列表
    const courses = await prisma.course.findMany({
      where: whereClause,
      orderBy: { orderIndex: 'asc' },
      include: {
        module: true,
        units: {
          include: {
            unit: {
              select: { id: true, code: true, title: true },
            },
          },
        },
        sessions: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' },
          select: { id: true, title: true, xpReward: true, orderIndex: true },
        },
        prerequisites: {
          include: {
            prerequisite: {
              select: { id: true, code: true, title: true },
            },
          },
        },
      },
    });

    // 获取用户课程进度
    const userCourseProgress = await prisma.userCourseProgress.findMany({
      where: { userId },
    });

    // 获取用户课时进度
    const userSessionProgress = await prisma.userSessionProgress.findMany({
      where: { userId },
    });

    // 构建依赖关系图
    const dependencies: { from: string; to: string }[] = [];

    // 合并数据
    const coursesWithProgress = courses.map(course => {
      const courseProgress = userCourseProgress.find(p => p.courseId === course.id);

      // 检查是否解锁：所有前置课程都已完成
      const allPrereqsCompleted = course.prerequisites.length === 0 ||
        course.prerequisites.every(prereq =>
          userCourseProgress.some(p => p.courseId === prereq.prerequisiteId && p.completed)
        );

      // 第一个课程默认解锁
      const isFirstCourse = course.orderIndex === 1;
      const isUnlocked = isFirstCourse || allPrereqsCompleted;

      // 添加依赖关系
      course.prerequisites.forEach(prereq => {
        dependencies.push({
          from: prereq.prerequisite.code,
          to: course.code,
        });
      });

      // 计算课时完成数
      const completedSessions = course.sessions.filter(session =>
        userSessionProgress.some(p => p.sessionId === session.id && p.completed)
      ).length;

      return {
        id: course.id,
        code: course.code,
        title: course.title,
        description: course.description,
        objectives: course.objectives,
        orderIndex: course.orderIndex,
        tier: course.tier,
        moduleId: course.moduleId,
        moduleName: course.module?.name,
        moduleIcon: course.module?.icon,
        units: course.units.map(u => ({
          id: u.unit.id,
          code: u.unit.code,
          title: u.unit.title,
        })),
        sessions: course.sessions.map(s => {
          const sessionProgress = userSessionProgress.find(p => p.sessionId === s.id);
          return {
            id: s.id,
            title: s.title,
            xpReward: s.xpReward,
            orderIndex: s.orderIndex,
            completed: sessionProgress?.completed || false,
            perfectRun: sessionProgress?.perfectRun || false,
          };
        }),
        unlocked: isUnlocked,
        completed: courseProgress?.completed || false,
        sessionsCompleted: completedSessions,
        totalSessions: course.sessions.length,
        crownLevel: courseProgress?.crownLevel || 0,
        prerequisites: course.prerequisites.map(p => ({
          id: p.prerequisite.id,
          code: p.prerequisite.code,
          title: p.prerequisite.title,
        })),
      };
    });

    // 获取当前梯队/模块信息
    let tierInfo = null;
    if (tier) {
      const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
      const totalCourses = coursesWithProgress.length;
      const completedCourses = coursesWithProgress.filter(c => c.completed).length;
      tierInfo = {
        id: tier,
        name: tierConfig.name,
        color: tierConfig.color,
        totalCourses,
        completedCourses,
        completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
      };
    }

    res.json({
      tier: tierInfo,
      courses: coursesWithProgress,
      dependencies,
    });
  } catch (error) {
    next(error);
  }
});

// 获取课程详情
router.get('/:courseId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        module: true,
        units: {
          include: {
            unit: {
              select: { id: true, code: true, title: true, description: true, coreLevel: true },
            },
          },
        },
        sessions: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' },
          include: {
            exercises: {
              include: {
                exercise: {
                  select: { id: true, title: true, type: true, xp: true, difficulty: true },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        prerequisites: {
          include: {
            prerequisite: {
              select: { id: true, code: true, title: true },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: '课程不存在' });
    }

    // 获取用户课程进度
    const courseProgress = await prisma.userCourseProgress.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    // 获取用户课时进度
    const sessionProgressList = await prisma.userSessionProgress.findMany({
      where: {
        userId,
        sessionId: { in: course.sessions.map(s => s.id) },
      },
    });

    // 检查是否解锁
    const allPrereqsCompleted = course.prerequisites.length === 0 ||
      (await prisma.userCourseProgress.findMany({
        where: {
          userId,
          courseId: { in: course.prerequisites.map(p => p.prerequisiteId) },
          completed: true,
        },
      })).length === course.prerequisites.length;

    const isFirstCourse = course.orderIndex === 1;
    const isUnlocked = isFirstCourse || allPrereqsCompleted;

    const sessionsWithProgress = course.sessions.map(session => {
      const progress = sessionProgressList.find(p => p.sessionId === session.id);
      return {
        id: session.id,
        title: session.title,
        description: session.description,
        orderIndex: session.orderIndex,
        xpReward: session.xpReward,
        exercises: session.exercises.map(e => ({
          id: e.exercise.id,
          title: e.exercise.title,
          type: e.exercise.type,
          xp: e.exercise.xp,
          difficulty: e.exercise.difficulty,
        })),
        completed: progress?.completed || false,
        mistakes: progress?.mistakes || 0,
        perfectRun: progress?.perfectRun || false,
      };
    });

    res.json({
      id: course.id,
      code: course.code,
      title: course.title,
      description: course.description,
      objectives: course.objectives,
      tier: course.tier,
      moduleId: course.moduleId,
      moduleName: course.module?.name,
      moduleIcon: course.module?.icon,
      units: course.units.map(u => ({
        id: u.unit.id,
        code: u.unit.code,
        title: u.unit.title,
        description: u.unit.description,
        coreLevel: u.unit.coreLevel,
      })),
      sessions: sessionsWithProgress,
      unlocked: isUnlocked,
      completed: courseProgress?.completed || false,
      sessionsCompleted: sessionProgressList.filter(p => p.completed).length,
      totalSessions: course.sessions.length,
      crownLevel: courseProgress?.crownLevel || 0,
      totalXpEarned: courseProgress?.totalXpEarned || 0,
      prerequisites: course.prerequisites.map(p => ({
        id: p.prerequisite.id,
        code: p.prerequisite.code,
        title: p.prerequisite.title,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// 开始课时
router.post('/sessions/:sessionId/start', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    const session = await prisma.courseSession.findUnique({
      where: { id: sessionId },
      include: {
        course: true,
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: '课时不存在' });
    }

    // 创建或更新课时进度
    await prisma.userSessionProgress.upsert({
      where: { userId_sessionId: { userId, sessionId } },
      update: { mistakes: 0 },
      create: {
        userId,
        sessionId,
        completed: false,
        mistakes: 0,
        perfectRun: false,
      },
    });

    // 确保课程进度存在
    await prisma.userCourseProgress.upsert({
      where: { userId_courseId: { userId, courseId: session.courseId } },
      update: { unlocked: true, startedAt: new Date() },
      create: {
        userId,
        courseId: session.courseId,
        unlocked: true,
        completed: false,
        sessionsCompleted: 0,
        crownLevel: 0,
        startedAt: new Date(),
      },
    });

    res.json({
      message: '课时已开始',
      exercises: session.exercises.map(e => e.exercise),
    });
  } catch (error) {
    next(error);
  }
});

// 完成课时
router.post('/sessions/:sessionId/complete', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { sessionId } = req.params;
    const { mistakes = 0 } = req.body;
    const userId = req.user!.id;

    const session = await prisma.courseSession.findUnique({
      where: { id: sessionId },
      include: {
        course: {
          include: {
            sessions: { where: { isPublished: true } },
            prerequisites: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: '课时不存在' });
    }

    const perfectRun = mistakes === 0;
    const xpEarned = session.xpReward + (perfectRun ? Math.floor(session.xpReward * 0.2) : 0);

    // 更新课时进度
    await prisma.userSessionProgress.upsert({
      where: { userId_sessionId: { userId, sessionId } },
      update: {
        completed: true,
        mistakes,
        perfectRun,
        xpEarned: { increment: xpEarned },
        completedCount: { increment: 1 },
        lastCompletedAt: new Date(),
      },
      create: {
        userId,
        sessionId,
        completed: true,
        mistakes,
        perfectRun,
        xpEarned,
        completedCount: 1,
        lastCompletedAt: new Date(),
      },
    });

    // 计算课程完成的课时数
    const completedSessions = await prisma.userSessionProgress.count({
      where: {
        userId,
        session: { courseId: session.courseId },
        completed: true,
      },
    });

    const totalSessions = session.course.sessions.length;
    const courseCompleted = completedSessions >= totalSessions;

    // 更新课程进度
    const courseProgress = await prisma.userCourseProgress.upsert({
      where: { userId_courseId: { userId, courseId: session.courseId } },
      update: {
        sessionsCompleted: completedSessions,
        completed: courseCompleted,
        totalXpEarned: { increment: xpEarned },
        crownLevel: courseCompleted ? { increment: 1 } : undefined,
        completedAt: courseCompleted ? new Date() : undefined,
      },
      create: {
        userId,
        courseId: session.courseId,
        unlocked: true,
        completed: courseCompleted,
        sessionsCompleted: completedSessions,
        crownLevel: courseCompleted ? 1 : 0,
        totalXpEarned: xpEarned,
        completedAt: courseCompleted ? new Date() : undefined,
      },
    });

    // 更新用户XP
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpEarned },
        totalXp: { increment: xpEarned },
      },
    });

    // 更新每日XP记录
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyXpRecord.upsert({
      where: { userId_date: { userId, date: today } },
      update: { xpEarned: { increment: xpEarned } },
      create: {
        userId,
        date: today,
        xpEarned,
        goalMet: false,
      },
    });

    // 如果课程完成，解锁依赖当前课程的后续课程
    if (courseCompleted) {
      const dependentCourses = await prisma.coursePrerequisite.findMany({
        where: { prerequisiteId: session.courseId },
        include: {
          course: {
            include: {
              prerequisites: true,
            },
          },
        },
      });

      for (const dep of dependentCourses) {
        // 检查所有前置课程是否都已完成
        const allPrereqsCompleted = await prisma.userCourseProgress.findMany({
          where: {
            userId,
            courseId: { in: dep.course.prerequisites.map(p => p.prerequisiteId) },
            completed: true,
          },
        });

        if (allPrereqsCompleted.length === dep.course.prerequisites.length) {
          await prisma.userCourseProgress.upsert({
            where: { userId_courseId: { userId, courseId: dep.courseId } },
            update: { unlocked: true },
            create: {
              userId,
              courseId: dep.courseId,
              unlocked: true,
              completed: false,
              sessionsCompleted: 0,
              crownLevel: 0,
            },
          });
        }
      }
    }

    res.json({
      message: '课时完成',
      xpEarned,
      perfectRun,
      courseCompleted,
      sessionsCompleted: completedSessions,
      totalSessions,
      crownLevel: courseProgress.crownLevel,
    });
  } catch (error) {
    next(error);
  }
});

// 获取课时详情
router.get('/sessions/:sessionId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    const session = await prisma.courseSession.findUnique({
      where: { id: sessionId },
      include: {
        course: {
          select: { id: true, code: true, title: true },
        },
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: '课时不存在' });
    }

    // 获取用户课时进度
    const sessionProgress = await prisma.userSessionProgress.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });

    // 获取用户练习进度
    const exerciseProgress = await prisma.exerciseProgress.findMany({
      where: {
        userId,
        exerciseId: { in: session.exercises.map(e => e.exerciseId) },
      },
    });

    const exercisesWithProgress = session.exercises.map(e => {
      const progress = exerciseProgress.find(p => p.exerciseId === e.exerciseId);
      return {
        ...e.exercise,
        completed: progress?.completed || false,
      };
    });

    res.json({
      id: session.id,
      title: session.title,
      description: session.description,
      orderIndex: session.orderIndex,
      xpReward: session.xpReward,
      course: session.course,
      exercises: exercisesWithProgress,
      completed: sessionProgress?.completed || false,
      mistakes: sessionProgress?.mistakes || 0,
      perfectRun: sessionProgress?.perfectRun || false,
    });
  } catch (error) {
    next(error);
  }
});

export { router as coursesRouter };
