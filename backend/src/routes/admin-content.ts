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
        module: { select: { id: true, name: true, icon: true } },
        courses: {
          include: {
            course: { select: { id: true, code: true, title: true } }
          }
        },
        _count: { select: { courses: true } }
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
    const { title, description, icon, color, requiredXp, moduleId, tier, code, coreLevel } = req.body;

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
        moduleId,
        tier,
        code,
        coreLevel,
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
    const { title, description, icon, color, requiredXp, moduleId, tier, code, coreLevel, isPublished } = req.body;

    const unit = await prisma.skillUnit.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(requiredXp !== undefined && { requiredXp }),
        ...(moduleId !== undefined && { moduleId }),
        ...(tier !== undefined && { tier }),
        ...(code !== undefined && { code }),
        ...(coreLevel !== undefined && { coreLevel }),
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
router.get('/courses', async (req: AuthRequest, res: Response, next) => {
  try {
    const { moduleId } = req.query;

    const courses = await prisma.course.findMany({
      where: moduleId ? { moduleId: Number(moduleId) } : undefined,
      orderBy: [{ moduleId: 'asc' }, { orderIndex: 'asc' }],
      include: {
        module: { select: { id: true, name: true, icon: true } },
        units: {
          include: { unit: { select: { id: true, title: true, code: true } } }
        },
        sessions: {
          orderBy: { orderIndex: 'asc' },
          select: { id: true, title: true, orderIndex: true, xpReward: true, isPublished: true }
        },
        _count: { select: { sessions: true, units: true } }
      }
    });

    res.json(courses);
  } catch (error) {
    next(error);
  }
});

// 获取单个课程详情
router.get('/courses/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        module: { select: { id: true, name: true, icon: true } },
        units: {
          include: { unit: { select: { id: true, title: true, code: true } } }
        },
        sessions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            exercises: {
              orderBy: { orderIndex: 'asc' },
              include: { exercise: { select: { id: true, title: true, type: true, difficulty: true } } }
            }
          }
        }
      }
    });

    if (!course) {
      throw new AppError('课程不存在', 404);
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
});

// 创建课程
router.post('/courses', async (req: AuthRequest, res: Response, next) => {
  try {
    const { code, title, description, objectives, tier, moduleId, unitIds, isPublished } = req.body;

    if (!code || !title || !moduleId) {
      throw new AppError('课程编号、标题和所属模块不能为空', 400);
    }

    // 获取该模块下最大 orderIndex
    const maxOrder = await prisma.course.aggregate({
      where: { moduleId },
      _max: { orderIndex: true }
    });
    const orderIndex = (maxOrder._max.orderIndex || 0) + 1;

    const course = await prisma.course.create({
      data: {
        code,
        title,
        description,
        objectives: objectives || [],
        tier: tier || 'CSP_J',
        moduleId,
        orderIndex,
        isPublished: isPublished ?? true,
        units: unitIds?.length ? {
          create: unitIds.map((unitId: string) => ({ unitId }))
        } : undefined
      },
      include: {
        units: { include: { unit: { select: { id: true, title: true, code: true } } } }
      }
    });

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
});

// 更新课程
router.put('/courses/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { code, title, description, objectives, tier, moduleId, unitIds, isPublished } = req.body;

    // 如果更新知识单元关联，先删除旧的
    if (unitIds !== undefined) {
      await prisma.courseUnit.deleteMany({ where: { courseId: id } });
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(code !== undefined && { code }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(objectives !== undefined && { objectives }),
        ...(tier !== undefined && { tier }),
        ...(moduleId !== undefined && { moduleId }),
        ...(isPublished !== undefined && { isPublished }),
        ...(unitIds !== undefined && {
          units: {
            create: unitIds.map((unitId: string) => ({ unitId }))
          }
        })
      },
      include: {
        units: { include: { unit: { select: { id: true, title: true, code: true } } } }
      }
    });

    res.json(course);
  } catch (error) {
    next(error);
  }
});

// 删除课程
router.delete('/courses/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    // 检查是否有课时
    const sessionsCount = await prisma.courseSession.count({ where: { courseId: id } });
    if (sessionsCount > 0) {
      throw new AppError('该课程下还有课时，请先删除课时', 400);
    }

    await prisma.course.delete({ where: { id } });

    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

// ==================== 课时管理 ====================

// 创建课时
router.post('/courses/:courseId/sessions', async (req: AuthRequest, res: Response, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, xpReward, isPublished } = req.body;

    if (!title) {
      throw new AppError('课时标题不能为空', 400);
    }

    // 获取该课程下最大 orderIndex
    const maxOrder = await prisma.courseSession.aggregate({
      where: { courseId },
      _max: { orderIndex: true }
    });
    const orderIndex = (maxOrder._max.orderIndex || 0) + 1;

    const session = await prisma.courseSession.create({
      data: {
        title,
        description,
        courseId,
        xpReward: xpReward || 10,
        orderIndex,
        isPublished: isPublished ?? true
      }
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

// 更新课时
router.put('/sessions/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { title, description, xpReward, isPublished } = req.body;

    const session = await prisma.courseSession.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(xpReward !== undefined && { xpReward }),
        ...(isPublished !== undefined && { isPublished })
      }
    });

    res.json(session);
  } catch (error) {
    next(error);
  }
});

// 删除课时
router.delete('/sessions/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    await prisma.courseSession.delete({ where: { id } });

    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

// 关联题目到课时
router.post('/sessions/:sessionId/exercises', async (req: AuthRequest, res: Response, next) => {
  try {
    const { sessionId } = req.params;
    const { exerciseId } = req.body;

    if (!exerciseId) {
      throw new AppError('题目ID不能为空', 400);
    }

    // 获取最大 orderIndex
    const maxOrder = await prisma.sessionExercise.aggregate({
      where: { sessionId },
      _max: { orderIndex: true }
    });
    const orderIndex = (maxOrder._max.orderIndex || 0) + 1;

    const sessionExercise = await prisma.sessionExercise.create({
      data: { sessionId, exerciseId, orderIndex },
      include: { exercise: { select: { id: true, title: true, type: true, difficulty: true } } }
    });

    res.status(201).json(sessionExercise);
  } catch (error) {
    next(error);
  }
});

// 移除课时的题目关联
router.delete('/sessions/:sessionId/exercises/:exerciseId', async (req: AuthRequest, res: Response, next) => {
  try {
    const { sessionId, exerciseId } = req.params;

    await prisma.sessionExercise.delete({
      where: { sessionId_exerciseId: { sessionId, exerciseId } }
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

// 获取模块列表
router.get('/modules', async (req: AuthRequest, res: Response, next) => {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: { select: { skillUnits: true, courses: true } }
      }
    });
    res.json(modules);
  } catch (error) {
    next(error);
  }
});

// ==================== 题目管理 ====================

// 获取题目列表
router.get('/exercises', async (req: AuthRequest, res: Response, next) => {
  try {
    const { courseId, sessionId, type, knowledgePointId, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (sessionId) {
      where.sessionExercises = { some: { sessionId: sessionId as string } };
    } else if (courseId) {
      where.sessionExercises = {
        some: { session: { courseId: courseId as string } }
      };
    }
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
          sessionExercises: {
            include: {
              session: { select: { id: true, title: true, course: { select: { id: true, code: true, title: true } } } }
            }
          },
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
        sessionExercises: {
          include: {
            session: { select: { id: true, title: true, course: { select: { id: true, code: true, title: true } } } }
          }
        },
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
      hint, solution, xp, type, questionData,
      knowledgePointIds
    } = req.body;

    if (!title || !description || !difficulty || !category) {
      throw new AppError('必填字段不能为空', 400);
    }

    // 获取最大 orderIndex
    const maxOrder = await prisma.exercise.aggregate({
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
      hint, solution, xp, type, questionData,
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
