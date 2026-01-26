import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// 兑换码兑换
router.post('/redeem', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: '请输入兑换码' });
    }

    const trimmedCode = code.trim().toUpperCase();

    // 查找兑换码
    const redeemCode = await prisma.redeemCode.findUnique({
      where: { code: trimmedCode },
    });

    if (!redeemCode) {
      return res.status(400).json({
        success: false,
        error: 'code_invalid',
        message: '兑换码无效',
      });
    }

    // 检查是否过期
    if (redeemCode.expiresAt && new Date() > redeemCode.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'code_expired',
        message: '兑换码已过期',
      });
    }

    // 检查使用次数
    if (redeemCode.usedCount >= redeemCode.maxUses) {
      return res.status(400).json({
        success: false,
        error: 'code_used',
        message: '兑换码已被使用完',
      });
    }

    // 检查用户是否已兑换过
    const existingRecord = await prisma.redeemRecord.findUnique({
      where: {
        userId_codeId: { userId, codeId: redeemCode.id },
      },
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        error: 'already_redeemed',
        message: '你已经兑换过此兑换码',
      });
    }

    // 执行兑换
    const updateData: any = {};
    let rewardMessage = '';

    switch (redeemCode.type) {
      case 'GEMS':
        updateData.gems = { increment: redeemCode.value };
        rewardMessage = `成功获得 ${redeemCode.value} 宝石！`;
        break;
      case 'HEARTS':
        // 获取用户当前心数
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { hearts: true, maxHearts: true },
        });
        if (user) {
          const newHearts = Math.min(user.hearts + redeemCode.value, user.maxHearts);
          updateData.hearts = newHearts;
          updateData.heartsUpdatedAt = new Date();
        }
        rewardMessage = `成功获得 ${redeemCode.value} 心！`;
        break;
      case 'STREAK_PROTECT':
        // Streak 保护：设置 lastStudyDate 为昨天
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        updateData.lastStudyDate = yesterday;
        updateData.streakProtectedAt = new Date();
        rewardMessage = `成功获得 Streak 保护！`;
        break;
    }

    // 使用事务更新
    await prisma.$transaction([
      // 更新用户数据
      prisma.user.update({
        where: { id: userId },
        data: updateData,
      }),
      // 创建兑换记录
      prisma.redeemRecord.create({
        data: {
          userId,
          codeId: redeemCode.id,
        },
      }),
      // 更新兑换码使用次数
      prisma.redeemCode.update({
        where: { id: redeemCode.id },
        data: {
          usedCount: { increment: 1 },
        },
      }),
    ]);

    // 获取更新后的用户数据
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        gems: true,
        hearts: true,
        streak: true,
      },
    });

    res.json({
      success: true,
      type: redeemCode.type,
      value: redeemCode.value,
      message: rewardMessage,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// 获取用户兑换记录
router.get('/history', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const records = await prisma.redeemRecord.findMany({
      where: { userId },
      include: {
        code: {
          select: {
            code: true,
            type: true,
            value: true,
          },
        },
      },
      orderBy: { redeemedAt: 'desc' },
      take: 50,
    });

    res.json({
      records: records.map(r => ({
        id: r.id,
        code: r.code.code,
        type: r.code.type,
        value: r.code.value,
        redeemedAt: r.redeemedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// ==================== 管理员接口 ====================

// 创建兑换码（仅管理员）
router.post('/', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { code, type, value, maxUses = 1, expiresAt, note } = req.body;
    const createdBy = req.user!.id;

    if (!code || !type || !value) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    if (!['GEMS', 'HEARTS', 'STREAK_PROTECT'].includes(type)) {
      return res.status(400).json({ error: '无效的兑换码类型' });
    }

    // 检查兑换码是否已存在
    const existing = await prisma.redeemCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return res.status(400).json({ error: '兑换码已存在' });
    }

    const redeemCode = await prisma.redeemCode.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        maxUses,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy,
        note,
      },
    });

    res.status(201).json(redeemCode);
  } catch (error) {
    next(error);
  }
});

// 获取所有兑换码（仅管理员）
router.get('/', authenticate, requireRole('ADMIN'), async (_req: AuthRequest, res: Response, next) => {
  try {
    const codes = await prisma.redeemCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { records: true },
        },
      },
    });

    res.json({
      codes: codes.map(c => ({
        ...c,
        redemptionCount: c._count.records,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// 删除兑换码（仅管理员）
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    await prisma.redeemCode.delete({
      where: { id },
    });

    res.json({ success: true, message: '兑换码已删除' });
  } catch (error) {
    next(error);
  }
});

// 批量生成兑换码（仅管理员）
router.post('/batch', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { prefix = 'CODE', type, value, count = 10, maxUses = 1, expiresAt, note } = req.body;
    const createdBy = req.user!.id;

    if (!type || !value || !count) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    if (!['GEMS', 'HEARTS', 'STREAK_PROTECT'].includes(type)) {
      return res.status(400).json({ error: '无效的兑换码类型' });
    }

    const codes: string[] = [];
    const createdCodes: any[] = [];

    for (let i = 0; i < count; i++) {
      // 生成随机码
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = `${prefix}-${randomPart}`;
      codes.push(code);
    }

    // 批量创建
    for (const code of codes) {
      try {
        const created = await prisma.redeemCode.create({
          data: {
            code,
            type,
            value,
            maxUses,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            createdBy,
            note,
          },
        });
        createdCodes.push(created);
      } catch {
        // 如果重复则跳过
      }
    }

    res.status(201).json({
      success: true,
      count: createdCodes.length,
      codes: createdCodes,
    });
  } catch (error) {
    next(error);
  }
});

export { router as redeemRouter };
