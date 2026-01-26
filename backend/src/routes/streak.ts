import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Streak 保护价格
const STREAK_PROTECT_COST = 50;


/**
 * 检查 Streak 是否中断
 */
function checkStreakStatus(user: {
  streak: number;
  lastStudyDate: Date | null;
  streakProtectedAt: Date | null;
}): {
  streak: number;
  isAtRisk: boolean;
  isBroken: boolean;
  canProtect: boolean;
  protectDeadline: Date | null;
  previousStreak: number | null;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (!user.lastStudyDate) {
    return {
      streak: 0,
      isAtRisk: false,
      isBroken: false,
      canProtect: false,
      protectDeadline: null,
      previousStreak: null,
    };
  }

  const lastStudy = new Date(user.lastStudyDate);
  const lastStudyDay = new Date(lastStudy.getFullYear(), lastStudy.getMonth(), lastStudy.getDate());

  // 今天已学习
  if (lastStudyDay.getTime() === today.getTime()) {
    return {
      streak: user.streak,
      isAtRisk: false,
      isBroken: false,
      canProtect: false,
      protectDeadline: null,
      previousStreak: null,
    };
  }

  // 昨天学习过，今天还没学习（有风险）
  if (lastStudyDay.getTime() === yesterday.getTime()) {
    return {
      streak: user.streak,
      isAtRisk: true,
      isBroken: false,
      canProtect: false,
      protectDeadline: null,
      previousStreak: null,
    };
  }

  // Streak 已中断
  const daysSinceLastStudy = Math.floor((today.getTime() - lastStudyDay.getTime()) / (1000 * 60 * 60 * 24));

  // 检查是否在保护窗口内
  const protectDeadline = new Date(lastStudyDay);
  protectDeadline.setDate(protectDeadline.getDate() + 1);
  protectDeadline.setHours(23, 59, 59, 999);

  const canProtect = daysSinceLastStudy <= 2 && now <= protectDeadline;

  return {
    streak: 0,
    isAtRisk: false,
    isBroken: true,
    canProtect,
    protectDeadline: canProtect ? protectDeadline : null,
    previousStreak: user.streak,
  };
}

// 获取当前 Streak 状态
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        lastStudyDate: true,
        streakProtectedAt: true,
        gems: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const status = checkStreakStatus(user);

    res.json({
      streak: status.streak,
      lastStudyDate: user.lastStudyDate,
      isAtRisk: status.isAtRisk,
      isBroken: status.isBroken,
      canProtect: status.canProtect,
      protectDeadline: status.protectDeadline,
      previousStreak: status.previousStreak,
      protectCost: STREAK_PROTECT_COST,
      userGems: user.gems,
    });
  } catch (error) {
    next(error);
  }
});

// 购买 Streak 保护
router.post('/protect', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        lastStudyDate: true,
        streakProtectedAt: true,
        gems: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const status = checkStreakStatus(user);

    // 检查是否可以使用保护
    if (!status.canProtect) {
      return res.status(400).json({
        error: status.isBroken ? '保护窗口已过期' : 'Streak 未中断，无需保护',
      });
    }

    // 检查宝石是否足够
    if (user.gems < STREAK_PROTECT_COST) {
      return res.status(400).json({
        error: '宝石不足',
        required: STREAK_PROTECT_COST,
        current: user.gems,
      });
    }

    // 恢复 Streak
    const previousStreak = status.previousStreak || user.streak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        streak: previousStreak,
        lastStudyDate: yesterday, // 设置为昨天，这样今天学习会 +1
        streakProtectedAt: new Date(),
        gems: { decrement: STREAK_PROTECT_COST },
      },
      select: {
        streak: true,
        lastStudyDate: true,
        gems: true,
      },
    });

    res.json({
      success: true,
      message: `成功恢复 ${previousStreak} 天连续学习记录`,
      streak: updatedUser.streak,
      gemsSpent: STREAK_PROTECT_COST,
      gemsRemaining: updatedUser.gems,
    });
  } catch (error) {
    next(error);
  }
});

// 获取 Streak 里程碑奖励
router.get('/milestones', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const milestones = [
      { days: 7, xpReward: 50, gemsReward: 20, name: '坚持一周' },
      { days: 30, xpReward: 200, gemsReward: 50, name: '月度学霸' },
      { days: 100, xpReward: 500, gemsReward: 150, name: '百日坚持' },
      { days: 365, xpReward: 1000, gemsReward: 500, name: '年度传奇' },
    ];

    const milestonesWithStatus = milestones.map(m => ({
      ...m,
      achieved: user.streak >= m.days,
      progress: Math.min(user.streak / m.days * 100, 100),
    }));

    res.json({
      currentStreak: user.streak,
      milestones: milestonesWithStatus,
    });
  } catch (error) {
    next(error);
  }
});

export { router as streakRouter };
