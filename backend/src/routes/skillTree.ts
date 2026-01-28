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
        lessons: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' },
          include: {
            exercises: {
              select: { id: true, title: true, type: true, xp: true },
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

    const userLessonProgress = await prisma.userLessonProgress.findMany({
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
        lessons: lessonsWithProgress,
        unlocked: isUnlocked,
        completed: unitProgress?.completed || false,
        lessonsCompleted: unitProgress?.lessonsCompleted || 0,
        totalLessons: unit.lessons.length,
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
        lessons: {
          where: { isPublished: true },
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
      moduleName: unit.module?.name,
      moduleIcon: unit.module?.icon,
      lessons: lessonsWithProgress,
      unlocked: unitProgress?.unlocked || false,
      completed: unitProgress?.completed || false,
      lessonsCompleted: unitProgress?.lessonsCompleted || 0,
      crownLevel: unitProgress?.crownLevel || 0,
      prerequisites: unit.prerequisites.map(p => ({
        id: p.prerequisite.id,
        code: p.prerequisite.code,
        title: p.prerequisite.title,
      })),
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
          select: { id: true, title: true, icon: true, code: true },
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
      where: { unitId: lesson.unitId, isPublished: true },
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
    const completedExercises = await prisma.exerciseProgress.findMany({
      where: {
        userId,
        exerciseId: { in: lesson.exercises.map(e => e.id) },
        completed: true,
      },
    });

    const xpEarned = completedExercises.reduce((sum, progress) => {
      const exercise = lesson.exercises.find(e => e.id === progress.exerciseId);
      return sum + (exercise?.xp || 0);
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

    // 解锁依赖当前单元的知识点
    if (unitCompleted) {
      // 获取所有依赖当前单元的知识点，并包含它们的所有前置条件
      const dependentUnits = await prisma.skillUnitPrerequisite.findMany({
        where: { prerequisiteId: lesson.unitId },
        include: {
          unit: {
            include: {
              prerequisites: true,
            },
          },
        },
      });

      // 获取所有相关前置条件的完成状态（一次性查询）
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

      // 批量处理解锁
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
              lessonsCompleted: 0,
              crownLevel: 0,
            },
          });
        }
      }
    }

    res.json({
      message: '课程完成',
      xpEarned: xpEarned + bonusXp,
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
