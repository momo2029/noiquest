import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { ReminderType } from '@prisma/client';

const router = Router();

// 获取提醒列表
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const unreadOnly = req.query.unread === 'true';

    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
      where.dismissed = false;
    }

    const reminders = await prisma.reviewReminder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(reminders);
  } catch (error) {
    next(error);
  }
});

// 获取未读提醒数量
router.get('/count', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const count = await prisma.reviewReminder.count({
      where: {
        userId: req.user!.id,
        read: false,
        dismissed: false,
      },
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
});

// 标记已读
router.post('/:id/read', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.reviewReminder.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 标记全部已读
router.post('/read-all', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.reviewReminder.updateMany({
      where: {
        userId: req.user!.id,
        read: false,
      },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 忽略提醒
router.post('/:id/dismiss', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.reviewReminder.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      data: { dismissed: true },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 删除提醒
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.reviewReminder.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 创建提醒（内部调用）
export async function createReminder(
  userId: string,
  type: ReminderType,
  title: string,
  message: string,
  data?: any
) {
  // 检查是否已有相同类型的未读提醒
  const existing = await prisma.reviewReminder.findFirst({
    where: {
      userId,
      type,
      read: false,
      dismissed: false,
    },
  });

  if (existing) {
    // 更新现有提醒
    await prisma.reviewReminder.update({
      where: { id: existing.id },
      data: { title, message, data, createdAt: new Date() },
    });
    return existing.id;
  }

  // 创建新提醒
  const reminder = await prisma.reviewReminder.create({
    data: { userId, type, title, message, data },
  });

  return reminder.id;
}

// 生成复习提醒（定时任务调用）
export async function generateReviewReminders() {
  const users = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, lastStudyDate: true, streak: true },
  });

  for (const user of users) {
    // 1. 检查到期复习内容
    const dueReviews = await prisma.knowledgeMastery.count({
      where: {
        userId: user.id,
        nextReviewAt: { lte: new Date() },
      },
    });

    if (dueReviews > 0) {
      await createReminder(
        user.id,
        'DUE_REVIEW',
        '复习提醒',
        `你有 ${dueReviews} 个知识点需要复习`,
        { count: dueReviews }
      );
    }

    // 2. 检查错题累积
    const mistakesCount = await prisma.mistakeRecord.count({
      where: {
        userId: user.id,
        status: 'UNREVIEWED',
      },
    });

    if (mistakesCount >= 10) {
      await createReminder(
        user.id,
        'MISTAKES_PILE',
        '错题本提醒',
        `你的错题本已有 ${mistakesCount} 道题目，建议复习`,
        { count: mistakesCount }
      );
    }

    // 3. 检查连续学习天数风险
    if (user.lastStudyDate && user.streak > 0) {
      const lastStudy = new Date(user.lastStudyDate);
      const now = new Date();
      const hoursSinceLastStudy = (now.getTime() - lastStudy.getTime()) / (1000 * 60 * 60);

      // 如果距离上次学习超过20小时但不到24小时，提醒保持连续
      if (hoursSinceLastStudy >= 20 && hoursSinceLastStudy < 24) {
        await createReminder(
          user.id,
          'STREAK_RISK',
          '连续学习提醒',
          `你已连续学习 ${user.streak} 天，今天别忘了学习哦！`,
          { streak: user.streak }
        );
      }

      // 如果超过3天没学习
      if (hoursSinceLastStudy >= 72) {
        await createReminder(
          user.id,
          'INACTIVE',
          '学习提醒',
          '已经好几天没有学习了，回来继续吧！',
          { daysSinceLastStudy: Math.floor(hoursSinceLastStudy / 24) }
        );
      }
    }
  }
}

// 检查用户的复习提醒（登录时调用）
export async function checkUserReminders(userId: string) {
  // 检查到期复习
  const dueReviews = await prisma.knowledgeMastery.count({
    where: {
      userId,
      nextReviewAt: { lte: new Date() },
    },
  });

  if (dueReviews > 0) {
    await createReminder(
      userId,
      'DUE_REVIEW',
      '复习提醒',
      `你有 ${dueReviews} 个知识点需要复习`,
      { count: dueReviews }
    );
  }

  // 检查错题
  const mistakesCount = await prisma.mistakeRecord.count({
    where: {
      userId,
      status: 'UNREVIEWED',
    },
  });

  if (mistakesCount >= 5) {
    await createReminder(
      userId,
      'MISTAKES_PILE',
      '错题本提醒',
      `你的错题本有 ${mistakesCount} 道题目待复习`,
      { count: mistakesCount }
    );
  }
}

export const remindersRouter = router;
