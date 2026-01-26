import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 获取当前宝石数量
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        gems: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      gems: user.gems,
    });
  } catch (error) {
    next(error);
  }
});

// 获取宝石获取/消费记录（可选功能）
router.get('/history', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    // 获取最近的兑换记录
    const redeemRecords = await prisma.redeemRecord.findMany({
      where: { userId },
      include: {
        code: {
          select: {
            type: true,
            value: true,
          },
        },
      },
      orderBy: { redeemedAt: 'desc' },
      take: 20,
    });

    // 格式化记录
    const history = redeemRecords.map(record => ({
      id: record.id,
      type: 'redeem',
      amount: record.code.type === 'GEMS' ? record.code.value : 0,
      description: `兑换码兑换`,
      createdAt: record.redeemedAt,
    }));

    res.json({
      history,
    });
  } catch (error) {
    next(error);
  }
});

export { router as gemsRouter };
