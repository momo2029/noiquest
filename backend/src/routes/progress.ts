import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { giveTeacherBonus } from '../utils/teacherBonus.js';
import { recordTransaction, TransactionSource } from '../utils/currencyTransaction.js';

const router = Router();

// 等级经验值配置
const levelXpRequirements = [
  0, 50, 120, 200, 300, 420, 560, 720, 900, 1100,
  1320, 1560, 1820, 2100, 2400, 2720, 3060, 3420, 3800, 4200,
];

function calculateLevel(totalXp: number): number {
  let level = 1;
  for (let i = 1; i < levelXpRequirements.length; i++) {
    if (totalXp >= levelXpRequirements[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

// 获取用户所有进度
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const progress = await prisma.exerciseProgress.findMany({
      where: { userId: req.user!.id },
      include: {
        exercise: {
          select: { id: true, title: true, category: true, difficulty: true, xp: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// 获取单个练习的进度
router.get('/:exerciseId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const progress = await prisma.exerciseProgress.findUnique({
      where: {
        userId_exerciseId: {
          userId: req.user!.id,
          exerciseId: req.params.exerciseId,
        },
      },
    });

    res.json(progress || { completed: false });
  } catch (error) {
    next(error);
  }
});

// 保存代码进度
router.post('/:exerciseId/save', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { code } = req.body;

    const progress = await prisma.exerciseProgress.upsert({
      where: {
        userId_exerciseId: {
          userId: req.user!.id,
          exerciseId: req.params.exerciseId,
        },
      },
      update: { code },
      create: {
        userId: req.user!.id,
        exerciseId: req.params.exerciseId,
        code,
      },
    });

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// 完成练习
router.post('/:exerciseId/complete', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { code } = req.body;
    const exerciseId = req.params.exerciseId;
    const userId = req.user!.id;

    // 获取练习信息
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new AppError('练习题不存在', 404);
    }

    // 检查是否已完成
    const existingProgress = await prisma.exerciseProgress.findUnique({
      where: {
        userId_exerciseId: { userId, exerciseId },
      },
    });

    const isFirstCompletion = !existingProgress?.completed;

    // 更新进度
    const progress = await prisma.exerciseProgress.upsert({
      where: {
        userId_exerciseId: { userId, exerciseId },
      },
      update: {
        completed: true,
        code,
        completedAt: new Date(),
      },
      create: {
        userId,
        exerciseId,
        completed: true,
        code,
        completedAt: new Date(),
      },
    });

    let xpGained = 0;
    let gemsGained = 0;
    let levelUp = false;
    let newLevel = 0;

    // 首次完成给予奖励
    if (isFirstCompletion) {
      xpGained = exercise.xp;
      gemsGained = Math.floor(exercise.xp / 10);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        const newTotalXp = user.totalXp + xpGained;
        const oldLevel = user.level;
        newLevel = calculateLevel(newTotalXp);
        levelUp = newLevel > oldLevel;

        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: user.xp + xpGained,
            totalXp: newTotalXp,
            gems: user.gems + gemsGained,
            level: newLevel,
          },
        });

        // 记录经验值交易明细
        if (xpGained > 0) {
          await recordTransaction({
            userId,
            type: 'EARN',
            currency: 'XP',
            amount: xpGained,
            source: TransactionSource.EXERCISE_COMPLETE,
            sourceId: exerciseId,
            note: `完成练习: ${exercise.title}`,
          });
        }

        // 记录宝石交易明细
        if (gemsGained > 0) {
          await recordTransaction({
            userId,
            type: 'EARN',
            currency: 'GEMS',
            amount: gemsGained,
            source: TransactionSource.EXERCISE_COMPLETE,
            sourceId: exerciseId,
            note: `完成练习: ${exercise.title}`,
          });

          // 给教师发放钻石分成
          await giveTeacherBonus(userId, gemsGained, exerciseId);
        }
      }
    }

    res.json({
      progress,
      rewards: {
        xpGained,
        gemsGained,
        levelUp,
        newLevel,
        isFirstCompletion,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as progressRouter };
