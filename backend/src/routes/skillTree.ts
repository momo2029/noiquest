import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, optionalAuthenticate, AuthRequest } from '../middleware/auth.js';
import { Tier } from '@prisma/client';

const router = Router();

// 梯队配置
const TIER_CONFIG = {
  CSP_J: { name: '入门篇', color: '#22c55e', order: 1, unlockRate: 0 },
  CSP_S: { name: '进阶篇', color: '#3b82f6', order: 2, unlockRate: 80 },
  PROVINCIAL: { name: '省选/NOI', color: '#a855f7', order: 3, unlockRate: 80 },
  IOI: { name: '大师篇', color: '#ef4444', order: 4, unlockRate: 80 },
};

// ==================== 公开 API（不需要登录） ====================

// 公开获取所有梯队（不含用户进度）
router.get('/public/tiers', async (req, res, next) => {
  try {
    // 获取每个梯队的知识点数量
    const tierCounts = await prisma.skillUnit.groupBy({
      by: ['tier'],
      _count: { id: true },
      where: { isPublished: true },
    });

    // 构建梯队列表（不含用户进度）
    const tiers = Object.entries(TIER_CONFIG).map(([tierId, config]) => {
      const totalUnits = tierCounts.find(t => t.tier === tierId)?._count.id || 0;

      return {
        id: tierId,
        name: config.name,
        color: config.color,
        order: config.order,
        totalUnits,
        completedUnits: 0,
        completionRate: 0,
        unlocked: tierId === 'CSP_J', // 只有第一个梯队默认解锁
        unlockRequirement: config.unlockRate > 0 ? `完成上一梯队 ${config.unlockRate}%` : null,
      };
    });

    res.json({ tiers });
  } catch (error) {
    next(error);
  }
});

// 公开获取所有模块（不含用户进度）
router.get('/public/modules', async (req, res, next) => {
  try {
    const { tier } = req.query;

    // 获取模块列表
    const modules = await prisma.module.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    // 获取每个模块在指定梯队的知识点数量
    const whereClause: any = { isPublished: true };
    if (tier) {
      whereClause.tier = tier as Tier;
    }

    const unitCounts = await prisma.skillUnit.groupBy({
      by: ['moduleId'],
      _count: { id: true },
      where: whereClause,
    });

    const modulesWithCounts = modules.map(mod => {
      const total = unitCounts.find(u => u.moduleId === mod.id)?._count.id || 0;

      return {
        ...mod,
        totalUnits: total,
        completedUnits: 0,
        completionRate: 0,
      };
    });

    res.json({ modules: modulesWithCounts });
  } catch (error) {
    next(error);
  }
});

// 公开获取技能树结构（不含用户进度）
router.get('/public', async (req, res, next) => {
  try {
    const { tier, moduleId } = req.query;

    // 构建查询条件
    const whereClause: any = { isPublished: true };
    if (tier) {
      whereClause.tier = tier as Tier;
    }
    if (moduleId) {
      whereClause.moduleId = parseInt(moduleId as string);
    }

    // 获取技能单元
    const units = await prisma.skillUnit.findMany({
      where: whereClause,
      orderBy: { orderIndex: 'asc' },
      include: {
        courses: {
          include: {
            course: {
              include: {
                sessions: {
                  where: { isPublished: true },
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
          },
        },
        module: true,
        prerequisites: {
          include: {
            prerequisite: {
              select: { id: true, code: true, title: true },
            },
          },
        },
        dependentUnits: {
          include: {
            unit: {
              select: { id: true, code: true, title: true },
            },
          },
        },
      },
    });

    // 构建依赖关系图
    const dependencies: { from: string; to: string }[] = [];

    // 构建技能树（不含用户进度）
    const skillTree = units.map(unit => {
      // 添加依赖关系
      unit.prerequisites.forEach(prereq => {
        dependencies.push({
          from: prereq.prerequisite.code!,
          to: unit.code!,
        });
      });

      // 第一个没有前置条件的单元默认解锁
      const isUnlocked = unit.prerequisites.length === 0;

      // 获取关联的课程和课时
      const courses = unit.courses.map(cu => ({
        ...cu.course,
        sessions: cu.course.sessions.map(session => ({
          ...session,
          completed: false,
          mistakes: 0,
          perfectRun: false,
        })),
      }));

      return {
        id: unit.id,
        code: unit.code,
        title: unit.title,
        description: unit.description,
        icon: unit.icon,
        color: unit.color,
        tier: unit.tier,
        moduleId: unit.moduleId,
        moduleName: unit.module?.name,
        moduleIcon: unit.module?.icon,
        coreLevel: unit.coreLevel,
        orderIndex: unit.orderIndex,
        courses,
        unlocked: isUnlocked,
        completed: false,
        sessionsCompleted: 0,
        totalSessions: courses.reduce((sum, c) => sum + c.sessions.length, 0),
        crownLevel: 0,
        prerequisites: unit.prerequisites.map(p => ({
          id: p.prerequisite.id,
          code: p.prerequisite.code,
          title: p.prerequisite.title,
        })),
        dependents: unit.dependentUnits.map(d => ({
          id: d.unit.id,
          code: d.unit.code,
          title: d.unit.title,
        })),
      };
    });

    // 获取当前梯队信息
    let currentTier = null;
    if (tier) {
      const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
      currentTier = {
        id: tier,
        name: tierConfig.name,
        color: tierConfig.color,
        totalUnits: skillTree.length,
        completedUnits: 0,
        completionRate: 0,
      };
    }

    res.json({
      tier: currentTier,
      skillTree,
      dependencies,
      userTotalXp: 0,
    });
  } catch (error) {
    next(error);
  }
});

// ==================== 需要登录的 API ====================

// 获取所有梯队状态
router.get('/tiers', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    // 获取每个梯队的知识点数量
    const tierCounts = await prisma.skillUnit.groupBy({
      by: ['tier'],
      _count: { id: true },
      where: { isPublished: true },
    });

    // 获取用户在每个梯队的完成数量
    const userProgress = await prisma.userUnitProgress.findMany({
      where: { userId, completed: true },
      include: { unit: { select: { tier: true } } },
    });

    const completedByTier: Record<string, number> = {};
    userProgress.forEach(p => {
      const tier = p.unit.tier;
      completedByTier[tier] = (completedByTier[tier] || 0) + 1;
    });

    // 构建梯队列表
    const tiers = Object.entries(TIER_CONFIG).map(([tierId, config]) => {
      const totalUnits = tierCounts.find(t => t.tier === tierId)?._count.id || 0;
      const completedUnits = completedByTier[tierId] || 0;
      const completionRate = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

      // 计算是否解锁
      let unlocked = tierId === 'CSP_J'; // CSP_J 默认解锁
      if (!unlocked && config.order > 1) {
        // 检查前一个梯队的完成率
        const prevTierEntries = Object.entries(TIER_CONFIG).filter(([, c]) => c.order === config.order - 1);
        if (prevTierEntries.length > 0) {
          const prevTierId = prevTierEntries[0][0];
          const prevTotal = tierCounts.find(t => t.tier === prevTierId)?._count.id || 0;
          const prevCompleted = completedByTier[prevTierId] || 0;
          const prevRate = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 0;
          unlocked = prevRate >= config.unlockRate;
        }
      }

      return {
        id: tierId,
        name: config.name,
        color: config.color,
        order: config.order,
        totalUnits,
        completedUnits,
        completionRate,
        unlocked,
        unlockRequirement: config.unlockRate > 0 ? `完成上一梯队 ${config.unlockRate}%` : null,
      };
    });

    res.json({ tiers });
  } catch (error) {
    next(error);
  }
});

// 获取所有模块
router.get('/modules', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { tier } = req.query;

    // 获取模块列表
    const modules = await prisma.module.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    // 获取每个模块在指定梯队的知识点数量
    const whereClause: any = { isPublished: true };
    if (tier) {
      whereClause.tier = tier as Tier;
    }

    const unitCounts = await prisma.skillUnit.groupBy({
      by: ['moduleId'],
      _count: { id: true },
      where: whereClause,
    });

    // 获取用户完成的知识点
    const completedUnits = await prisma.userUnitProgress.findMany({
      where: { userId, completed: true },
      include: { unit: { select: { moduleId: true, tier: true } } },
    });

    const modulesWithProgress = modules.map(mod => {
      const total = unitCounts.find(u => u.moduleId === mod.id)?._count.id || 0;
      const completed = completedUnits.filter(u => {
        if (tier && u.unit.tier !== tier) return false;
        return u.unit.moduleId === mod.id;
      }).length;

      return {
        ...mod,
        totalUnits: total,
        completedUnits: completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    res.json({ modules: modulesWithProgress });
  } catch (error) {
    next(error);
  }
});

// 获取技能树结构和用户进度（支持按梯队和模块筛选）
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

    // 获取技能单元
    const units = await prisma.skillUnit.findMany({
      where: whereClause,
      orderBy: { orderIndex: 'asc' },
      include: {
        courses: {
          include: {
            course: {
              include: {
                sessions: {
                  where: { isPublished: true },
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
          },
        },
        module: true,
        prerequisites: {
          include: {
            prerequisite: {
              select: { id: true, code: true, title: true },
            },
          },
        },
        dependentUnits: {
          include: {
            unit: {
              select: { id: true, code: true, title: true },
            },
          },
        },
      },
    });

    // 获取用户进度
    const userUnitProgress = await prisma.userUnitProgress.findMany({
      where: { userId },
    });

    const userSessionProgress = await prisma.userSessionProgress.findMany({
      where: { userId },
    });

    // 获取用户总 XP
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true },
    });

    // 构建依赖关系图（用于前端绘制连线）
    const dependencies: { from: string; to: string }[] = [];

    // 合并数据
    const skillTree = units.map(unit => {
      const unitProgress = userUnitProgress.find(p => p.unitId === unit.id);

      // 检查是否解锁：所有前置知识点都已完成
      const allPrereqsCompleted = unit.prerequisites.length === 0 ||
        unit.prerequisites.every(prereq =>
          userUnitProgress.some(p => p.unitId === prereq.prerequisiteId && p.completed)
        );

      const isUnlocked = allPrereqsCompleted;

      // 添加依赖关系
      unit.prerequisites.forEach(prereq => {
        dependencies.push({
          from: prereq.prerequisite.code!,
          to: unit.code!,
        });
      });

      // 获取关联的课程和课时（带进度）
      const courses = unit.courses.map(cu => ({
        ...cu.course,
        sessions: cu.course.sessions.map(session => {
          const sessionProgress = userSessionProgress.find(p => p.sessionId === session.id);
          return {
            ...session,
            completed: sessionProgress?.completed || false,
            mistakes: sessionProgress?.mistakes || 0,
            perfectRun: sessionProgress?.perfectRun || false,
          };
        }),
      }));

      const totalSessions = courses.reduce((sum, c) => sum + c.sessions.length, 0);
      const completedSessions = courses.reduce(
        (sum, c) => sum + c.sessions.filter(s => s.completed).length,
        0
      );

      return {
        id: unit.id,
        code: unit.code,
        title: unit.title,
        description: unit.description,
        icon: unit.icon,
        color: unit.color,
        tier: unit.tier,
        moduleId: unit.moduleId,
        moduleName: unit.module?.name,
        moduleIcon: unit.module?.icon,
        coreLevel: unit.coreLevel,
        orderIndex: unit.orderIndex,
        courses,
        unlocked: isUnlocked,
        completed: unitProgress?.completed || false,
        sessionsCompleted: completedSessions,
        totalSessions,
        crownLevel: unitProgress?.crownLevel || 0,
        prerequisites: unit.prerequisites.map(p => ({
          id: p.prerequisite.id,
          code: p.prerequisite.code,
          title: p.prerequisite.title,
        })),
        dependents: unit.dependentUnits.map(d => ({
          id: d.unit.id,
          code: d.unit.code,
          title: d.unit.title,
        })),
      };
    });

    // 获取当前梯队信息
    let currentTier = null;
    if (tier) {
      const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
      const totalUnits = skillTree.length;
      const completedUnits = skillTree.filter(u => u.completed).length;
      currentTier = {
        id: tier,
        name: tierConfig.name,
        color: tierConfig.color,
        totalUnits,
        completedUnits,
        completionRate: totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0,
      };
    }

    res.json({
      tier: currentTier,
      skillTree,
      dependencies,
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
        courses: {
          include: {
            course: {
              include: {
                sessions: {
                  where: { isPublished: true },
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    exercises: {
                      orderBy: { orderIndex: 'asc' },
                      include: {
                        exercise: {
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
                  },
                },
              },
            },
          },
        },
        module: true,
        prerequisites: {
          include: {
            prerequisite: {
              select: { id: true, code: true, title: true },
            },
          },
        },
      },
    });

    if (!unit) {
      return res.status(404).json({ error: '单元不存在' });
    }

    // 获取用户进度
    const unitProgress = await prisma.userUnitProgress.findUnique({
      where: { userId_unitId: { userId, unitId } },
    });

    // 获取所有课时ID
    const allSessionIds = unit.courses.flatMap(cu =>
      cu.course.sessions.map(s => s.id)
    );

    const sessionProgressList = await prisma.userSessionProgress.findMany({
      where: {
        userId,
        sessionId: { in: allSessionIds },
      },
    });

    // 构建带进度的课程数据
    const coursesWithProgress = unit.courses.map(cu => ({
      ...cu.course,
      sessions: cu.course.sessions.map(session => {
        const progress = sessionProgressList.find(p => p.sessionId === session.id);
        return {
          ...session,
          exercises: session.exercises.map(se => se.exercise),
          completed: progress?.completed || false,
          mistakes: progress?.mistakes || 0,
          perfectRun: progress?.perfectRun || false,
        };
      }),
    }));

    const totalSessions = coursesWithProgress.reduce((sum, c) => sum + c.sessions.length, 0);
    const completedSessions = coursesWithProgress.reduce(
      (sum, c) => sum + c.sessions.filter(s => s.completed).length,
      0
    );

    res.json({
      ...unit,
      moduleName: unit.module?.name,
      moduleIcon: unit.module?.icon,
      courses: coursesWithProgress,
      unlocked: unitProgress?.unlocked || false,
      completed: unitProgress?.completed || false,
      sessionsCompleted: completedSessions,
      totalSessions,
      crownLevel: unitProgress?.crownLevel || 0,
      prerequisites: unit.prerequisites.map(p => ({
        id: p.prerequisite.id,
        code: p.prerequisite.code,
        title: p.prerequisite.title,
      })),
      // 学习资料字段
      content: unit.content,
      codeExamples: unit.codeExamples,
      videoUrl: unit.videoUrl,
      references: unit.references,
      tips: unit.tips,
      commonMistakes: unit.commonMistakes,
      estimatedTime: unit.estimatedTime,
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
          select: { id: true, code: true, title: true, moduleId: true },
        },
        exercises: {
          orderBy: { orderIndex: 'asc' },
          include: {
            exercise: true,
          },
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
    const exerciseIds = session.exercises.map(e => e.exerciseId);
    const exerciseProgress = await prisma.exerciseProgress.findMany({
      where: {
        userId,
        exerciseId: { in: exerciseIds },
      },
    });

    const exercisesWithProgress = session.exercises.map(se => {
      const progress = exerciseProgress.find(p => p.exerciseId === se.exerciseId);
      return {
        ...se.exercise,
        completed: progress?.completed || false,
      };
    });

    res.json({
      ...session,
      exercises: exercisesWithProgress,
      completed: sessionProgress?.completed || false,
      mistakes: sessionProgress?.mistakes || 0,
      perfectRun: sessionProgress?.perfectRun || false,
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
        course: {
          include: {
            units: true,
          },
        },
        exercises: {
          orderBy: { orderIndex: 'asc' },
          include: {
            exercise: true,
          },
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
      update: { unlocked: true },
      create: {
        userId,
        courseId: session.courseId,
        unlocked: true,
        completed: false,
        sessionsCompleted: 0,
        crownLevel: 0,
      },
    });

    // 确保关联的知识单元进度存在
    for (const cu of session.course.units) {
      await prisma.userUnitProgress.upsert({
        where: { userId_unitId: { userId, unitId: cu.unitId } },
        update: { unlocked: true },
        create: {
          userId,
          unitId: cu.unitId,
          unlocked: true,
          completed: false,
          crownLevel: 0,
        },
      });
    }

    res.json({
      message: '课时已开始',
      exercises: session.exercises.map(se => se.exercise),
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
            units: true,
            sessions: { where: { isPublished: true } },
          },
        },
        exercises: {
          include: { exercise: true },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: '课时不存在' });
    }

    const perfectRun = mistakes === 0;

    // 更新课时进度
    await prisma.userSessionProgress.upsert({
      where: { userId_sessionId: { userId, sessionId } },
      update: {
        completed: true,
        mistakes,
        perfectRun,
        completedCount: { increment: 1 },
        lastCompletedAt: new Date(),
      },
      create: {
        userId,
        sessionId,
        completed: true,
        mistakes,
        perfectRun,
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
        completedAt: courseCompleted ? new Date() : undefined,
      },
    });

    // 计算获得的 XP
    const exerciseIds = session.exercises.map(e => e.exerciseId);
    const completedExercises = await prisma.exerciseProgress.findMany({
      where: {
        userId,
        exerciseId: { in: exerciseIds },
        completed: true,
      },
    });

    const xpEarned = completedExercises.reduce((sum, progress) => {
      const exercise = session.exercises.find(e => e.exerciseId === progress.exerciseId);
      return sum + (exercise?.exercise.xp || 0);
    }, 0);

    // 完美通关奖励
    const bonusXp = perfectRun ? Math.floor(xpEarned * 0.2) : 0;

    if (bonusXp > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: bonusXp },
          totalXp: { increment: bonusXp },
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.dailyXpRecord.upsert({
        where: { userId_date: { userId, date: today } },
        update: { xpEarned: { increment: bonusXp } },
        create: {
          userId,
          date: today,
          xpEarned: bonusXp,
          goalMet: false,
        },
      });
    }

    // 如果课程完成，更新关联的知识单元进度
    if (courseCompleted) {
      for (const cu of session.course.units) {
        // 检查该知识单元关联的所有课程是否都完成
        const unitCourses = await prisma.courseUnit.findMany({
          where: { unitId: cu.unitId },
          include: { course: true },
        });

        const allCoursesCompleted = await Promise.all(
          unitCourses.map(async uc => {
            const progress = await prisma.userCourseProgress.findUnique({
              where: { userId_courseId: { userId, courseId: uc.courseId } },
            });
            return progress?.completed || false;
          })
        );

        const unitCompleted = allCoursesCompleted.every(c => c);

        await prisma.userUnitProgress.upsert({
          where: { userId_unitId: { userId, unitId: cu.unitId } },
          update: {
            completed: unitCompleted,
            crownLevel: unitCompleted ? { increment: 1 } : undefined,
          },
          create: {
            userId,
            unitId: cu.unitId,
            unlocked: true,
            completed: unitCompleted,
            crownLevel: unitCompleted ? 1 : 0,
          },
        });

        // 如果知识单元完成，解锁依赖它的知识单元
        if (unitCompleted) {
          const dependentUnits = await prisma.skillUnitPrerequisite.findMany({
            where: { prerequisiteId: cu.unitId },
            include: {
              unit: {
                include: { prerequisites: true },
              },
            },
          });

          const allPrereqIds = new Set<string>();
          dependentUnits.forEach(dep => {
            dep.unit.prerequisites.forEach(prereq => {
              allPrereqIds.add(prereq.prerequisiteId);
            });
          });

          const completedPrereqs = await prisma.userUnitProgress.findMany({
            where: {
              userId,
              unitId: { in: Array.from(allPrereqIds) },
              completed: true,
            },
            select: { unitId: true },
          });

          const completedPrereqSet = new Set(completedPrereqs.map(p => p.unitId));

          for (const dep of dependentUnits) {
            const allPrereqsCompleted = dep.unit.prerequisites.every(
              prereq => completedPrereqSet.has(prereq.prerequisiteId)
            );

            if (allPrereqsCompleted) {
              await prisma.userUnitProgress.upsert({
                where: { userId_unitId: { userId, unitId: dep.unitId } },
                update: { unlocked: true },
                create: {
                  userId,
                  unitId: dep.unitId,
                  unlocked: true,
                  completed: false,
                  crownLevel: 0,
                },
              });
            }
          }
        }
      }
    }

    res.json({
      message: '课时完成',
      xpEarned: xpEarned + bonusXp,
      bonusXp,
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

export { router as skillTreeRouter };
