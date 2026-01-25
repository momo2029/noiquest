import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// 获取所有练习题
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { category, difficulty } = req.query;

    const exercises = await prisma.exercise.findMany({
      where: {
        ...(category && { category: category as string }),
        ...(difficulty && { difficulty: difficulty as any }),
      },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        category: true,
        xp: true,
        orderIndex: true,
      },
    });

    res.json(exercises);
  } catch (error) {
    next(error);
  }
});

// 获取单个练习题详情
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: req.params.id },
    });

    if (!exercise) {
      return res.status(404).json({ error: '练习题不存在' });
    }

    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

// 获取练习题分类列表
router.get('/meta/categories', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const categories = await prisma.exercise.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    res.json(categories.map(c => c.category));
  } catch (error) {
    next(error);
  }
});

// 创建练习题（仅管理员/教师）
router.post('/', authenticate, requireRole('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, description, difficulty, category, starterCode, hint, solution, xp } = req.body;

    const exercise = await prisma.exercise.create({
      data: {
        title,
        description,
        difficulty,
        category,
        starterCode,
        hint,
        solution,
        xp: xp || 10,
      },
    });

    res.status(201).json(exercise);
  } catch (error) {
    next(error);
  }
});

// 更新练习题（仅管理员/教师）
router.patch('/:id', authenticate, requireRole('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, description, difficulty, category, starterCode, hint, solution, xp } = req.body;

    const exercise = await prisma.exercise.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(difficulty && { difficulty }),
        ...(category && { category }),
        ...(starterCode && { starterCode }),
        ...(hint !== undefined && { hint }),
        ...(solution !== undefined && { solution }),
        ...(xp && { xp }),
      },
    });

    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

export { router as exerciseRouter };
