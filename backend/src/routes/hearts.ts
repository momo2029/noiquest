import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 心恢复时间（分钟）
const HEART_RECOVERY_MINUTES = 60;

// 购买心的价格
const HEART_PRICES = {
  single: 50,   // 购买单个心
  full: 200,    // 补满全部心
};

/**
 * 计算当前心数和恢复时间
 */
function calculateCurrentHearts(user: {
  hearts: number;
  maxHearts: number;
  heartsUpdatedAt: Date;
}): {
  hearts: number;
  nextRecoveryIn: number | null;
  fullRecoveryIn: number | null;
} {
  const now = new Date();
  const lastUpdate = new Date(user.heartsUpdatedAt);
  const minutesPassed = (now.getTime() - lastUpdate.getTime()) / 1000 / 60;

  // 计算恢复了多少心
  const recoveredHearts = Math.floor(minutesPassed / HEART_RECOVERY_MINUTES);
  const currentHearts = Math.min(user.hearts + recoveredHearts, user.maxHearts);

  if (currentHearts >= user.maxHearts) {
    return { hearts: currentHearts, nextRecoveryIn: null, fullRecoveryIn: null };
  }

  // 计算下一颗心恢复时间（秒）
  const minutesSinceLastRecovery = minutesPassed % HEART_RECOVERY_MINUTES;
  const minutesToNextHeart = HEART_RECOVERY_MINUTES - minutesSinceLastRecovery;

  // 计算全部恢复时间（秒）
  const heartsNeeded = user.maxHearts - currentHearts;
  const minutesToFull = minutesToNextHeart + (heartsNeeded - 1) * HEART_RECOVERY_MINUTES;

  return {
    hearts: currentHearts,
    nextRecoveryIn: Math.ceil(minutesToNextHeart * 60),
    fullRecoveryIn: Math.ceil(minutesToFull * 60),
  };
}

// 获取当前生命值状态
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        hearts: true,
        maxHearts: true,
        heartsUpdatedAt: true,
        gems: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const { hearts, nextRecoveryIn, fullRecoveryIn } = calculateCurrentHearts(user);

    res.json({
      hearts,
      maxHearts: user.maxHearts,
      nextRecoveryIn,
      fullRecoveryIn,
      canStartLesson: hearts > 0,
      prices: HEART_PRICES,
      userGems: user.gems,
    });
  } catch (error) {
    next(error);
  }
});

// 购买生命值
router.post('/purchase', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { type } = req.body; // 'single' | 'full'

    if (!type || !['single', 'full'].includes(type)) {
      return res.status(400).json({ error: '无效的购买类型' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        hearts: true,
        maxHearts: true,
        heartsUpdatedAt: true,
        gems: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 计算当前实际心数
    const { hearts: currentHearts } = calculateCurrentHearts(user);

    // 检查是否已满
    if (currentHearts >= user.maxHearts) {
      return res.status(400).json({ error: '生命值已满，无需购买' });
    }

    const price = HEART_PRICES[type as keyof typeof HEART_PRICES];

    // 检查宝石是否足够
    if (user.gems < price) {
      return res.status(400).json({
        error: '宝石不足',
        required: price,
        current: user.gems,
      });
    }

    // 计算新的心数
    let newHearts: number;
    if (type === 'single') {
      newHearts = Math.min(currentHearts + 1, user.maxHearts);
    } else {
      newHearts = user.maxHearts;
    }

    // 更新用户数据
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hearts: newHearts,
        heartsUpdatedAt: new Date(),
        gems: { decrement: price },
      },
      select: {
        hearts: true,
        maxHearts: true,
        heartsUpdatedAt: true,
        gems: true,
      },
    });

    res.json({
      success: true,
      message: type === 'single' ? '成功购买 1 心' : '成功补满生命值',
      hearts: updatedUser.hearts,
      maxHearts: updatedUser.maxHearts,
      gemsSpent: price,
      gemsRemaining: updatedUser.gems,
    });
  } catch (error) {
    next(error);
  }
});

// 消耗生命值（内部使用，答错题时调用）
router.post('/consume', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { amount = 1 } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        hearts: true,
        maxHearts: true,
        heartsUpdatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 计算当前实际心数
    const { hearts: currentHearts } = calculateCurrentHearts(user);

    if (currentHearts <= 0) {
      return res.status(400).json({
        error: '生命值不足',
        hearts: 0,
      });
    }

    const newHearts = Math.max(currentHearts - amount, 0);

    // 更新用户数据
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hearts: newHearts,
        heartsUpdatedAt: new Date(),
      },
      select: {
        hearts: true,
        maxHearts: true,
        heartsUpdatedAt: true,
      },
    });

    const heartStatus = calculateCurrentHearts(updatedUser);

    res.json({
      hearts: heartStatus.hearts,
      maxHearts: updatedUser.maxHearts,
      nextRecoveryIn: heartStatus.nextRecoveryIn,
      canContinue: heartStatus.hearts > 0,
    });
  } catch (error) {
    next(error);
  }
});

export { router as heartsRouter };
