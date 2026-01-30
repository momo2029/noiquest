import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// XP 目标值映射
// 基于数据分析：平均每题14XP，每课时约10题，完成一个课时约155XP
const GOAL_XP_MAP = {
  CASUAL: 50,    // 约 3-4 道题，轻松学习
  REGULAR: 100,  // 约 7-8 道题，约半个课时
  SERIOUS: 200,  // 约 1 个完整课时
  INTENSE: 350,  // 约 2 个课时，高强度学习
};

// 获取每日状态
router.get('/status', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 获取用户每日设置
    let settings = await prisma.userDailySettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userDailySettings.create({
        data: {
          userId,
          dailyGoal: 'REGULAR',
          reminderEnabled: true,
        },
      });
    }

    // 获取今日 XP 记录
    let dailyXp = await prisma.dailyXpRecord.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (!dailyXp) {
      dailyXp = await prisma.dailyXpRecord.create({
        data: {
          userId,
          date: today,
          xpEarned: 0,
          goalMet: false,
        },
      });
    }

    const goalXp = GOAL_XP_MAP[settings.dailyGoal];
    const progress = Math.min(100, Math.round((dailyXp.xpEarned / goalXp) * 100));
    const goalMet = dailyXp.xpEarned >= goalXp;

    // 如果目标达成但未标记，更新状态
    if (goalMet && !dailyXp.goalMet) {
      await prisma.dailyXpRecord.update({
        where: { id: dailyXp.id },
        data: { goalMet: true },
      });
    }

    // 获取用户连续天数
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, lastStudyDate: true },
    });

    res.json({
      dailyGoal: settings.dailyGoal,
      goalXp,
      xpEarned: dailyXp.xpEarned,
      progress,
      goalMet,
      streak: user?.streak || 0,
      reminderEnabled: settings.reminderEnabled,
      reminderTime: settings.reminderTime,
    });
  } catch (error) {
    next(error);
  }
});

// 设置每日目标
router.put('/goal', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { dailyGoal, reminderEnabled, reminderTime } = req.body;

    const validGoals = ['CASUAL', 'REGULAR', 'SERIOUS', 'INTENSE'];
    if (dailyGoal && !validGoals.includes(dailyGoal)) {
      return res.status(400).json({ error: '无效的目标等级' });
    }

    const settings = await prisma.userDailySettings.upsert({
      where: { userId },
      update: {
        ...(dailyGoal && { dailyGoal }),
        ...(reminderEnabled !== undefined && { reminderEnabled }),
        ...(reminderTime !== undefined && { reminderTime }),
      },
      create: {
        userId,
        dailyGoal: dailyGoal || 'REGULAR',
        reminderEnabled: reminderEnabled ?? true,
        reminderTime,
      },
    });

    res.json({
      message: '目标设置已更新',
      settings: {
        dailyGoal: settings.dailyGoal,
        goalXp: GOAL_XP_MAP[settings.dailyGoal],
        reminderEnabled: settings.reminderEnabled,
        reminderTime: settings.reminderTime,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取每日任务
router.get('/quests', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 获取今日任务
    let quests = await prisma.userDailyQuest.findMany({
      where: { userId, date: today },
      include: {
        template: true,
      },
    });

    // 如果没有今日任务，从模板生成
    if (quests.length === 0) {
      const templates = await prisma.dailyQuestTemplate.findMany({
        where: { active: true },
        take: 3, // 每天 3 个任务
      });

      for (const template of templates) {
        await prisma.userDailyQuest.create({
          data: {
            userId,
            templateId: template.id,
            currentValue: 0,
            targetValue: template.targetValue,
            xpReward: template.xpReward,
            gemsReward: template.gemsReward,
            date: today,
            completed: false,
            claimed: false,
          },
        });
      }

      quests = await prisma.userDailyQuest.findMany({
        where: { userId, date: today },
        include: {
          template: true,
        },
      });
    }

    // 检查并更新任务完成状态
    for (const quest of quests) {
      if (!quest.completed && quest.currentValue >= quest.targetValue) {
        await prisma.userDailyQuest.update({
          where: { id: quest.id },
          data: { completed: true },
        });
        quest.completed = true;
      }
    }

    res.json(quests.map(q => ({
      id: q.id,
      title: q.template.title,
      description: q.template.description,
      questType: q.template.questType,
      currentValue: q.currentValue,
      targetValue: q.targetValue,
      progress: Math.min(100, Math.round((q.currentValue / q.targetValue) * 100)),
      completed: q.completed,
      claimed: q.claimed,
      xpReward: q.xpReward,
      gemsReward: q.gemsReward,
    })));
  } catch (error) {
    next(error);
  }
});

// 领取任务奖励
router.post('/quests/:questId/claim', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { questId } = req.params;
    const userId = req.user!.id;

    const quest = await prisma.userDailyQuest.findUnique({
      where: { id: questId },
      include: { template: true },
    });

    if (!quest) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (quest.userId !== userId) {
      return res.status(403).json({ error: '无权操作此任务' });
    }

    if (!quest.completed) {
      return res.status(400).json({ error: '任务尚未完成' });
    }

    if (quest.claimed) {
      return res.status(400).json({ error: '奖励已领取' });
    }

    // 标记为已领取
    await prisma.userDailyQuest.update({
      where: { id: questId },
      data: { claimed: true },
    });

    // 发放奖励
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: quest.xpReward },
        totalXp: { increment: quest.xpReward },
        gems: { increment: quest.gemsReward },
      },
    });

    // 更新每日 XP 记录
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyXpRecord.upsert({
      where: { userId_date: { userId, date: today } },
      update: { xpEarned: { increment: quest.xpReward } },
      create: {
        userId,
        date: today,
        xpEarned: quest.xpReward,
        goalMet: false,
      },
    });

    res.json({
      message: '奖励已领取',
      xpReward: quest.xpReward,
      gemsReward: quest.gemsReward,
    });
  } catch (error) {
    next(error);
  }
});

// 获取每日 XP 历史
router.get('/history', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    startDate.setHours(0, 0, 0, 0);

    const records = await prisma.dailyXpRecord.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    res.json(records.map(r => ({
      date: r.date,
      xpEarned: r.xpEarned,
      goalMet: r.goalMet,
    })));
  } catch (error) {
    next(error);
  }
});

export { router as dailyRouter };
