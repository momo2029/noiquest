import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// 获取当前用户信息
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
        level: true,
        xp: true,
        totalXp: true,
        streak: true,
        lastStudyDate: true,
        hearts: true,
        gems: true,
        classId: true,
        class: {
          select: { id: true, name: true },
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// 更新用户信息
router.patch('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
        level: true,
        xp: true,
        totalXp: true,
        streak: true,
        hearts: true,
        gems: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// 获取用户成就
router.get('/me/achievements', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: req.user!.id },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    res.json(achievements);
  } catch (error) {
    next(error);
  }
});

// 更新学习连续天数
router.post('/me/study', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
    if (lastStudy) {
      lastStudy.setHours(0, 0, 0, 0);
    }

    let newStreak = user.streak;

    if (!lastStudy || lastStudy.getTime() !== today.getTime()) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastStudy && lastStudy.getTime() === yesterday.getTime()) {
        newStreak = user.streak + 1;
      } else if (!lastStudy || lastStudy.getTime() < yesterday.getTime()) {
        newStreak = 1;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        streak: newStreak,
        lastStudyDate: new Date(),
      },
      select: {
        streak: true,
        lastStudyDate: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

export { router as userRouter };
