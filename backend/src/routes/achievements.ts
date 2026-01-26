import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 成就条件检查器
type ConditionChecker = (userId: string, value: number) => Promise<boolean>;

const conditionCheckers: Record<string, ConditionChecker> = {
  exercisesCompleted: async (userId, value) => {
    const count = await prisma.exerciseProgress.count({
      where: { userId, completed: true },
    });
    return count >= value;
  },
  lessonsCompleted: async (userId, value) => {
    const count = await prisma.userLessonProgress.count({
      where: { userId, completed: true },
    });
    return count >= value;
  },
  streak: async (userId, value) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true },
    });
    return (user?.streak || 0) >= value;
  },
  level: async (userId, value) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });
    return (user?.level || 0) >= value;
  },
  totalXp: async (userId, value) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true },
    });
    return (user?.totalXp || 0) >= value;
  },
  perfectLessons: async (userId, value) => {
    const count = await prisma.userLessonProgress.count({
      where: { userId, perfectRun: true },
    });
    return count >= value;
  },
  reviewCount: async (userId, value) => {
    const mastery = await prisma.knowledgeMastery.aggregate({
      where: { userId },
      _sum: { reviewCount: true },
    });
    return (mastery._sum.reviewCount || 0) >= value;
  },
  unitsCompleted: async (userId, value) => {
    const count = await prisma.userUnitProgress.count({
      where: { userId, completed: true },
    });
    return count >= value;
  },
  goldCrowns: async (userId, value) => {
    const count = await prisma.userUnitProgress.count({
      where: { userId, crownLevel: { gte: 3 } },
    });
    return count >= value;
  },
  completeEasyMedium: async (userId, _value) => {
    const easyMediumExercises = await prisma.exercise.count({
      where: { difficulty: { in: ['EASY', 'MEDIUM'] }, isPublished: true },
    });
    const completed = await prisma.exerciseProgress.count({
      where: {
        userId,
        completed: true,
        exercise: { difficulty: { in: ['EASY', 'MEDIUM'] } },
      },
    });
    return completed >= easyMediumExercises && easyMediumExercises > 0;
  },
};

// 计算成就进度
async function calculateProgress(userId: string, condition: { type: string; value: number }): Promise<number> {
  const { type, value } = condition;

  switch (type) {
    case 'exercisesCompleted': {
      const count = await prisma.exerciseProgress.count({
        where: { userId, completed: true },
      });
      return Math.min(count, value);
    }
    case 'lessonsCompleted': {
      const count = await prisma.userLessonProgress.count({
        where: { userId, completed: true },
      });
      return Math.min(count, value);
    }
    case 'streak': {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true },
      });
      return Math.min(user?.streak || 0, value);
    }
    case 'level': {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      return Math.min(user?.level || 0, value);
    }
    case 'perfectLessons': {
      const count = await prisma.userLessonProgress.count({
        where: { userId, perfectRun: true },
      });
      return Math.min(count, value);
    }
    default:
      return 0;
  }
}

// 获取所有成就
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    res.json(achievements);
  } catch (error) {
    next(error);
  }
});

// 获取用户成就（已解锁+进度）
router.get('/user', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    // 获取所有成就
    const achievements = await prisma.achievement.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    // 获取用户已解锁的成就
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    const unlocked: any[] = [];
    const inProgress: any[] = [];
    const locked: any[] = [];

    for (const achievement of achievements) {
      const condition = achievement.condition as { type: string; value: number };
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);

      if (unlockedIds.has(achievement.id)) {
        unlocked.push({
          ...achievement,
          unlockedAt: userAchievement?.unlockedAt,
        });
      } else {
        const progress = await calculateProgress(userId, condition);
        const percentage = Math.round((progress / condition.value) * 100);

        if (progress > 0) {
          inProgress.push({
            ...achievement,
            progress,
            target: condition.value,
            percentage,
          });
        } else {
          locked.push(achievement);
        }
      }
    }

    res.json({ unlocked, inProgress, locked });
  } catch (error) {
    next(error);
  }
});

// 检查并解锁成就
router.post('/check', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const newlyUnlocked = await checkAndUnlockAchievements(userId);

    res.json({
      checked: true,
      newlyUnlocked,
    });
  } catch (error) {
    next(error);
  }
});

// 检查并解锁成就（内部调用）
export async function checkAndUnlockAchievements(userId: string): Promise<any[]> {
  const achievements = await prisma.achievement.findMany();
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
  });

  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));
  const newlyUnlocked: any[] = [];

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    const condition = achievement.condition as { type: string; value: number };
    const checker = conditionCheckers[condition.type];

    if (!checker) continue;

    const isUnlocked = await checker(userId, condition.value);

    if (isUnlocked) {
      // 解锁成就
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress: condition.value,
          notified: false,
        },
      });

      // 发放奖励
      const reward = achievement.reward as { xp: number; gems: number };
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: reward.xp },
          xp: { increment: reward.xp },
          gems: { increment: reward.gems },
        },
      });

      newlyUnlocked.push({
        ...achievement,
        reward,
      });
    }
  }

  return newlyUnlocked;
}

// 标记成就通知已读
router.post('/:id/notified', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.userAchievement.updateMany({
      where: {
        achievementId: req.params.id,
        userId: req.user!.id,
      },
      data: { notified: true },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 获取未通知的成就
router.get('/unnotified', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const unnotified = await prisma.userAchievement.findMany({
      where: {
        userId: req.user!.id,
        notified: false,
      },
      include: { achievement: true },
    });

    res.json(unnotified);
  } catch (error) {
    next(error);
  }
});

export const achievementsRouter = router;
