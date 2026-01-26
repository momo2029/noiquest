import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 生成邀请码（仅管理员）
router.post('/generate', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { count = 1, type = 'STUDENT', expiresInDays, maxUses = 1, note } = req.body;

    if (count < 1 || count > 100) {
      throw new AppError('生成数量必须在 1-100 之间', 400);
    }

    const codes: string[] = [];
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

    for (let i = 0; i < count; i++) {
      // 生成 8 位邀请码
      const code = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();

      await prisma.inviteCode.create({
        data: {
          code,
          createdBy: req.user!.id,
          type,
          maxUses,
          expiresAt,
          note,
        },
      });

      codes.push(code);
    }

    res.json({
      message: `成功生成 ${count} 个邀请码`,
      codes,
      type,
      maxUses,
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
});

// 验证邀请码
router.post('/verify', async (req, res: Response, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new AppError('请提供邀请码', 400);
    }

    const inviteCode = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!inviteCode) {
      throw new AppError('邀请码不存在', 400);
    }

    if (inviteCode.expiresAt && inviteCode.expiresAt < new Date()) {
      throw new AppError('邀请码已过期', 400);
    }

    if (inviteCode.usedCount >= inviteCode.maxUses) {
      throw new AppError('邀请码已被使用', 400);
    }

    res.json({
      valid: true,
      type: inviteCode.type,
    });
  } catch (error) {
    next(error);
  }
});

// 使用邀请码（内部调用，注册时使用）
export async function useInviteCode(code: string): Promise<{ valid: boolean; type: string; error?: string }> {
  const inviteCode = await prisma.inviteCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  console.log(inviteCode+'-----');
  if (!inviteCode) {
    return { valid: false, type: '', error: '邀请码不存在' };
  }

  if (inviteCode.expiresAt && inviteCode.expiresAt < new Date()) {
    return { valid: false, type: '', error: '邀请码已过期' };
  }

  if (inviteCode.usedCount >= inviteCode.maxUses) {
    return { valid: false, type: '', error: '邀请码已被使用' };
  }

  // 更新使用次数
  await prisma.inviteCode.update({
    where: { code: code.toUpperCase() },
    data: {
      usedCount: { increment: 1 },
      usedAt: new Date(),
    },
  });

  return { valid: true, type: inviteCode.type };
}

// 获取邀请码列表（仅管理员）
router.get('/', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { page = 1, limit = 20, type, used } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (used === 'true') {
      where.usedCount = { gt: 0 };
    } else if (used === 'false') {
      where.usedCount = 0;
    }

    const [codes, total] = await Promise.all([
      prisma.inviteCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.inviteCode.count({ where }),
    ]);

    res.json({
      codes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// 删除邀请码（仅管理员）
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    await prisma.inviteCode.delete({
      where: { id },
    });

    res.json({ message: '邀请码已删除' });
  } catch (error) {
    next(error);
  }
});

// 批量删除过期邀请码（仅管理员）
router.delete('/expired/batch', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await prisma.inviteCode.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usedCount: { gte: prisma.inviteCode.fields.maxUses } },
        ],
      },
    });

    res.json({ message: `已删除 ${result.count} 个过期或已用完的邀请码` });
  } catch (error) {
    next(error);
  }
});

export { router as inviteRouter };
