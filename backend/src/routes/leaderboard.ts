import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { LeaderboardPeriod, LeagueLevel } from '@prisma/client';

const router = Router();

// 获取当前周期的 periodKey
function getPeriodKey(period: LeaderboardPeriod): string {
  const now = new Date();
  switch (period) {
    case 'DAILY':
      return now.toISOString().split('T')[0]; // 2024-01-20
    case 'WEEKLY':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1); // 周一
      const year = weekStart.getFullYear();
      const weekNum = Math.ceil((((weekStart.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + 1) / 7);
      return `${year}-W${String(weekNum).padStart(2, '0')}`; // 2024-W03
    case 'MONTHLY':
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // 2024-01
    case 'ALL_TIME':
      return 'all';
    default:
      return 'all';
  }
}

// 获取联赛配置
const LEAGUE_CONFIG: Record<LeagueLevel, { name: string; color: string; xpMultiplier: number; weeklyBonus: number }> = {
  BRONZE: { name: '青铜', color: '#CD7F32', xpMultiplier: 1.0, weeklyBonus: 0 },
  SILVER: { name: '白银', color: '#C0C0C0', xpMultiplier: 1.1, weeklyBonus: 20 },
  GOLD: { name: '黄金', color: '#FFD700', xpMultiplier: 1.2, weeklyBonus: 50 },
  DIAMOND: { name: '钻石', color: '#B9F2FF', xpMultiplier: 1.3, weeklyBonus: 100 },
  MASTER: { name: '大师', color: '#9B59B6', xpMultiplier: 1.5, weeklyBonus: 200 },
};

// 获取排行榜
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const period = (req.query.period as LeaderboardPeriod) || 'WEEKLY';
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const periodKey = getPeriodKey(period);

    const entries = await prisma.leaderboardEntry.findMany({
      where: { period, periodKey },
      orderBy: { xp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            league: { select: { league: true } },
          },
        },
      },
    });

    // 添加排名
    const rankedEntries = entries.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.user.username,
      name: entry.user.name,
      avatar: entry.user.avatar,
      xp: entry.xp,
      league: entry.user.league?.league || 'BRONZE',
    }));

    // 获取当前用户排名
    const myEntry = await prisma.leaderboardEntry.findUnique({
      where: {
        userId_period_periodKey: {
          userId: req.user!.id,
          period,
          periodKey,
        },
      },
    });

    let myRank = null;
    if (myEntry) {
      const higherCount = await prisma.leaderboardEntry.count({
        where: {
          period,
          periodKey,
          xp: { gt: myEntry.xp },
        },
      });
      myRank = {
        rank: higherCount + 1,
        xp: myEntry.xp,
      };
    }

    const totalParticipants = await prisma.leaderboardEntry.count({
      where: { period, periodKey },
    });

    res.json({
      period,
      periodKey,
      entries: rankedEntries,
      myRank,
      totalParticipants,
    });
  } catch (error) {
    next(error);
  }
});

// 获取我的排名详情
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const periods: LeaderboardPeriod[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME'];
    const rankings: Record<string, any> = {};

    for (const period of periods) {
      const periodKey = getPeriodKey(period);
      const myEntry = await prisma.leaderboardEntry.findUnique({
        where: {
          userId_period_periodKey: {
            userId: req.user!.id,
            period,
            periodKey,
          },
        },
      });

      if (myEntry) {
        const higherCount = await prisma.leaderboardEntry.count({
          where: {
            period,
            periodKey,
            xp: { gt: myEntry.xp },
          },
        });
        const totalCount = await prisma.leaderboardEntry.count({
          where: { period, periodKey },
        });

        rankings[period] = {
          rank: higherCount + 1,
          xp: myEntry.xp,
          total: totalCount,
          percentile: totalCount > 0 ? Math.round((1 - higherCount / totalCount) * 100) : 0,
        };
      } else {
        rankings[period] = null;
      }
    }

    res.json(rankings);
  } catch (error) {
    next(error);
  }
});

// 获取联赛信息
router.get('/league', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    let userLeague = await prisma.userLeague.findUnique({
      where: { userId: req.user!.id },
    });

    // 如果没有联赛记录，创建一个
    if (!userLeague) {
      userLeague = await prisma.userLeague.create({
        data: {
          userId: req.user!.id,
          league: 'BRONZE',
          weeklyXp: 0,
        },
      });
    }

    const config = LEAGUE_CONFIG[userLeague.league];

    // 获取同联赛的排名
    const sameLeagueUsers = await prisma.userLeague.findMany({
      where: { league: userLeague.league },
      orderBy: { weeklyXp: 'desc' },
    });

    const myIndex = sameLeagueUsers.findIndex(u => u.userId === req.user!.id);
    const totalInLeague = sameLeagueUsers.length;

    // 计算晋级/降级区
    const promotionThreshold = Math.ceil(totalInLeague * 0.2); // 前20%晋级
    const demotionThreshold = Math.ceil(totalInLeague * 0.1); // 后10%降级

    // 计算距离晋级还需要多少XP
    let xpNeededForPromotion = 0;
    if (myIndex >= promotionThreshold && promotionThreshold > 0) {
      const promotionLineUser = sameLeagueUsers[promotionThreshold - 1];
      xpNeededForPromotion = promotionLineUser.weeklyXp - userLeague.weeklyXp + 1;
    }

    // 计算周结束时间
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
    nextMonday.setHours(0, 0, 0, 0);
    const endsIn = nextMonday.getTime() - now.getTime();

    res.json({
      currentLeague: userLeague.league,
      leagueName: config.name,
      leagueColor: config.color,
      weeklyXp: userLeague.weeklyXp,
      weeklyRank: myIndex + 1,
      totalInLeague,
      promotionZone: {
        threshold: promotionThreshold,
        inZone: myIndex < promotionThreshold,
        xpNeeded: xpNeededForPromotion > 0 ? xpNeededForPromotion : 0,
      },
      demotionZone: {
        threshold: totalInLeague - demotionThreshold + 1,
        inZone: myIndex >= totalInLeague - demotionThreshold,
        safe: myIndex < totalInLeague - demotionThreshold,
      },
      rewards: {
        xpMultiplier: config.xpMultiplier,
        weeklyBonus: config.weeklyBonus,
      },
      endsIn,
      endsAt: nextMonday.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 更新用户排行榜数据（内部调用）
export async function updateLeaderboard(userId: string, xpEarned: number) {
  const periods: LeaderboardPeriod[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME'];

  for (const period of periods) {
    const periodKey = getPeriodKey(period);

    await prisma.leaderboardEntry.upsert({
      where: {
        userId_period_periodKey: { userId, period, periodKey },
      },
      update: {
        xp: { increment: xpEarned },
      },
      create: {
        userId,
        period,
        periodKey,
        xp: xpEarned,
      },
    });
  }

  // 更新联赛周XP
  await prisma.userLeague.upsert({
    where: { userId },
    update: {
      weeklyXp: { increment: xpEarned },
    },
    create: {
      userId,
      league: 'BRONZE',
      weeklyXp: xpEarned,
    },
  });
}

// 处理联赛晋级/降级（定时任务调用）
export async function processLeaguePromotions() {
  const leagues: LeagueLevel[] = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND', 'MASTER'];

  for (let i = 0; i < leagues.length; i++) {
    const currentLeague = leagues[i];
    const users = await prisma.userLeague.findMany({
      where: { league: currentLeague },
      orderBy: { weeklyXp: 'desc' },
    });

    const total = users.length;
    if (total === 0) continue;

    const promotionCount = Math.ceil(total * 0.2); // 前20%晋级
    const demotionCount = Math.ceil(total * 0.1); // 后10%降级

    // 晋级（不是最高级）
    if (i < leagues.length - 1) {
      const toPromote = users.slice(0, promotionCount);
      for (const user of toPromote) {
        await prisma.userLeague.update({
          where: { userId: user.userId },
          data: {
            league: leagues[i + 1],
            promotedAt: new Date(),
            weeklyXp: 0,
          },
        });
      }
    }

    // 降级（不是最低级）
    if (i > 0) {
      const toDemote = users.slice(-demotionCount);
      for (const user of toDemote) {
        await prisma.userLeague.update({
          where: { userId: user.userId },
          data: {
            league: leagues[i - 1],
            demotedAt: new Date(),
            weeklyXp: 0,
          },
        });
      }
    }

    // 重置其他用户的周XP
    const middleUsers = users.slice(promotionCount, -demotionCount || undefined);
    for (const user of middleUsers) {
      await prisma.userLeague.update({
        where: { userId: user.userId },
        data: { weeklyXp: 0 },
      });
    }
  }
}

export const leaderboardRouter = router;
