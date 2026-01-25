import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// 所有路由需要管理员权限
router.use(authenticate, requireRole('ADMIN'));

// ==================== 技能单元管理 ====================

// 获取所有技能单元
router.get('/skill-units', async (req: AuthRequest, res: Response, next) => {
  try {
    const units = await prisma.skillUnit.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          select: { id: true, title: true, orderIndex: true, isPublished: true }
        },
        _count: { select: { exercises: true, lessons: true } }
      }
    });
    res.json(units);
  } catch (error) {
    next(error);
  }
});

// 创建技能单元
router.post('/skill-units', async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, description, icon, color, requiredXp, prerequisiteId } = req.body;

    if (!title || !description) {
      throw new AppError('标题和描述不能为空', 400);
    }

    // 获取最大 orderIndex
    const maxOrder = await prisma.skillUnit.aggregate({ _max: { orderIndex: true } });
    const orderIndex = (maxOrder._max.orderIndex || 0) + 1;

    const unit = await prisma.skillUnit.create({
      data: {
        title,
        description,
        icon: icon || '📚',
        color: color || 'from-blue-400 to-blue-600',
        requiredXp: requiredXp || 0,
        prerequisiteId,
        orderIndex
      }
    });

    res.status(201).json(unit);
  } catch (error) {
    next(error);
  }
});

// 更新技能单元
router.put('/skill-units/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { title, description, icon, color, requiredXp, prerequisiteId, isPublished } = req.body;

    const unit = await prisma.skillUnit.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(requiredXp !== undefined && { requiredXp }),
        ...(prerequisiteId !== undefined && { prerequisiteId }),
        ...(isPublished !== undefined && { isPublished })
      }
    });

    res.json(unit);
  } catch (error) {
    next(error);
  }
});

// 删除技能单元
router.delete('/skill-units/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    await prisma.skillUnit.delete({ where: { id } });

    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

// 技能单元排序
router.put('/skill-units/reorder', async (req: AuthRequest, res: Response, next) => {
  try {
    const { orders } = req.body; // [{ id, orderIndex }]

    if (!Array.isArray(orders)) {
      throw new AppError('orders 必须是数组', 400);
    }

    await prisma.$transaction(
      orders.map(({ id, orderIndex }) =>
        prisma.skillUnit.update({
          where: { id },
          data: { orderIndex }
        })
      )
    );

    res.json({ message: '排序成功' });
  } catch (error) {
    next(error);
  }
});

// ==================== 课程管理 ====================

// 获取课程列表
router.get('/lessons', async (req: AuthRequest, res: Response, next) => {
  try {
    const { unitId } = req.query;

    const lessons = await prisma.lesson.findMany({
      where: unitId ? { unitId: unitId as string } : undefined,
      orderBy: [{ unitId: 'asc' }, { orderIndex: 'asc' }],
      include: {
        unit: { select: { id: true, title: true } },
        _count: { select: { exercises: true } }
      }
    });

    res.json(lessons);
  } catch (error) {
    next(error);
  }
});

// 创建课程
router.post('/lessons', async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, description, unitId } = req.body;

    if (!title || !unitId) {
      throw new AppError('标题和所属单元不能为空', 400);
    }

    // 获取该单元下最大 orderIndex
    const maxOrder = await prisma.lesson.aggregate({
      where: { unitId },
      _max: { orderIndex: true }
    });
    const orderIndex = (maxOrder._max.orderIndex || 0) + 1;

    const lesson = await prisma.lesson.create({
      data: { title, description, unitId, orderIndex }
    });

    res.status(201).json(lesson);
  } catch (error) {
    next(error);
  }
});

// 更新课程
router.put('/lessons/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { title, description, unitId, isPublished } = req.body;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(unitId !== undefined && { unitId }),
        ...(isPublished !== undefined && { isPublished })
      }
    });

    res.json(lesson);
  } catch (error) {
    next(error);
  }
});

// 删除课程
router.delete('/lessons/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    await prisma.lesson.delete({ where: { id } });

    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

// 课程排序
router.put('/lessons/reorder', async (req: AuthRequest, res: Response, next) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
      throw new AppError('orders 必须是数组', 400);
    }

    await prisma.$transaction(
      orders.map(({ id, orderIndex }) =>
        prisma.lesson.update({
          where: { id },
          data: { orderIndex }
        })
      )
    );

    res.json({ message: '排序成功' });
  } catch (error) {
    next(error);
  }
});

// ==================== 题目管理 ====================

// 获取题目列表
router.get('/exercises', async (req: AuthRequest, res: Response, next) => {
  try {
    const { unitId, lessonId, type, knowledgePointId, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (unitId) where.unitId = unitId;
    if (lessonId) where.lessonId = lessonId;
    if (type) where.type = type;
    if (knowledgePointId) {
      where.knowledgePoints = {
        some: { knowledgePointId: knowledgePointId as string }
      };
    }

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        orderBy: { orderIndex: 'asc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          unit: { select: { id: true, title: true } },
          lesson: { select: { id: true, title: true } },
          knowledgePoints: {
            include: { knowledgePoint: true }
          }
        }
      }),
      prisma.exercise.count({ where })
    ]);

    res.json({
      exercises,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取单个题目
router.get('/exercises/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        unit: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
        knowledgePoints: {
          include: { knowledgePoint: true }
        }
      }
    });

    if (!exercise) {
      throw new AppError('题目不存在', 404);
    }

    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

// 创建题目
router.post('/exercises', async (req: AuthRequest, res: Response, next) => {
  try {
    const {
      title, description, difficulty, category, starterCode,
      hint, solution, xp, type, questionData, unitId, lessonId,
      knowledgePointIds
    } = req.body;

    if (!title || !description || !difficulty || !category) {
      throw new AppError('必填字段不能为空', 400);
    }

    // 获取最大 orderIndex
    const maxOrder = await prisma.exercise.aggregate({
      where: lessonId ? { lessonId } : unitId ? { unitId } : {},
      _max: { orderIndex: true }
    });
    const orderIndex = (maxOrder._max.orderIndex || 0) + 1;

    const exercise = await prisma.exercise.create({
      data: {
        title,
        description,
        difficulty,
        category,
        starterCode: starterCode || '',
        hint,
        solution,
        xp: xp || 10,
        type: type || 'CODING',
        questionData,
        unitId,
        lessonId,
        orderIndex,
        knowledgePoints: knowledgePointIds?.length ? {
          create: knowledgePointIds.map((kpId: string) => ({
            knowledgePointId: kpId
          }))
        } : undefined
      },
      include: {
        knowledgePoints: { include: { knowledgePoint: true } }
      }
    });

    res.status(201).json(exercise);
  } catch (error) {
    next(error);
  }
});

// 更新题目
router.put('/exercises/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const {
      title, description, difficulty, category, starterCode,
      hint, solution, xp, type, questionData, unitId, lessonId,
      isPublished, knowledgePointIds
    } = req.body;

    // 如果更新知识点，先删除旧的关联
    if (knowledgePointIds !== undefined) {
      await prisma.exerciseKnowledgePoint.deleteMany({
        where: { exerciseId: id }
      });
    }

    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(difficulty !== undefined && { difficulty }),
        ...(category !== undefined && { category }),
        ...(starterCode !== undefined && { starterCode }),
        ...(hint !== undefined && { hint }),
        ...(solution !== undefined && { solution }),
        ...(xp !== undefined && { xp }),
        ...(type !== undefined && { type }),
        ...(questionData !== undefined && { questionData }),
        ...(unitId !== undefined && { unitId }),
        ...(lessonId !== undefined && { lessonId }),
        ...(isPublished !== undefined && { isPublished }),
        ...(knowledgePointIds !== undefined && {
          knowledgePoints: {
            create: knowledgePointIds.map((kpId: string) => ({
              knowledgePointId: kpId
            }))
          }
        })
      },
      include: {
        knowledgePoints: { include: { knowledgePoint: true } }
      }
    });

    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

// 删除题目
router.delete('/exercises/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    await prisma.exercise.delete({ where: { id } });

    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

// ==================== 知识点管理 ====================

// 获取知识点列表
router.get('/knowledge-points', async (req: AuthRequest, res: Response, next) => {
  try {
    const { category } = req.query;

    const knowledgePoints = await prisma.knowledgePoint.findMany({
      where: category ? { category: category as string } : undefined,
      orderBy: [{ category: 'asc' }, { orderIndex: 'asc' }],
      include: {
        _count: { select: { exercises: true } }
      }
    });

    res.json(knowledgePoints);
  } catch (error) {
    next(error);
  }
});

// 创建知识点
router.post('/knowledge-points', async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      throw new AppError('名称和分类不能为空', 400);
    }

    // 获取该分类下最大 orderIndex
    const maxOrder = await prisma.knowledgePoint.aggregate({
      where: { category },
      _max: { orderIndex: true }
    });
    const orderIndex = (maxOrder._max.orderIndex || 0) + 1;

    const knowledgePoint = await prisma.knowledgePoint.create({
      data: { name, category, orderIndex }
    });

    res.status(201).json(knowledgePoint);
  } catch (error) {
    next(error);
  }
});

// 更新知识点
router.put('/knowledge-points/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const knowledgePoint = await prisma.knowledgePoint.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category })
      }
    });

    res.json(knowledgePoint);
  } catch (error) {
    next(error);
  }
});

// 删除知识点
router.delete('/knowledge-points/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    await prisma.knowledgePoint.delete({ where: { id } });

    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

export { router as adminContentRouter };
