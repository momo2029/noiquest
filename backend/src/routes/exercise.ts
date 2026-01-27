import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
import { runTestCases } from '../services/cppExec.js';

const router = Router();

// 获取练习题分类列表（需要放在 /:id 之前）
router.get('/meta/categories', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { source } = req.query;

    const categories = await prisma.exercise.findMany({
      where: {
        ...(source && { source: source as string }),
        isPublished: true,
      },
      select: { category: true },
      distinct: ['category'],
    });

    res.json(categories.map(c => c.category));
  } catch (error) {
    next(error);
  }
});

// 获取推荐题目
router.get('/recommendations', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 5;

    const recommendations: any[] = [];

    // 1. 错题相关推荐（最高优先级）
    const recentMistakes = await prisma.mistakeRecord.findMany({
      where: {
        userId,
        source: 'EXERCISE_LIBRARY',
        status: { not: 'MASTERED' },
      },
      include: {
        exercise: {
          select: { category: true },
        },
      },
      orderBy: { lastWrongAt: 'desc' },
      take: 3,
    });

    for (const mistake of recentMistakes) {
      // 找同分类的其他未完成题目
      const relatedExercise = await prisma.exercise.findFirst({
        where: {
          source: 'EXERCISE_LIBRARY',
          type: 'CODING',
          category: mistake.exercise.category,
          isPublished: true,
          id: { not: mistake.exerciseId },
          progress: {
            none: {
              userId,
              completed: true,
            },
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          category: true,
          xp: true,
        },
      });

      if (relatedExercise && !recommendations.find(r => r.exercise.id === relatedExercise.id)) {
        recommendations.push({
          exercise: relatedExercise,
          reason: `巩固知识点：${mistake.exercise.category}`,
          priority: 1,
        });
      }
    }

    // 2. 薄弱知识点推荐
    const weakCategories = await prisma.knowledgeMastery.findMany({
      where: {
        userId,
        knowledgeType: 'category',
        masteryLevel: { lt: 60 },
      },
      orderBy: { masteryLevel: 'asc' },
      take: 3,
    });

    for (const weak of weakCategories) {
      const exercise = await prisma.exercise.findFirst({
        where: {
          source: 'EXERCISE_LIBRARY',
          type: 'CODING',
          category: weak.knowledgeKey,
          isPublished: true,
          progress: {
            none: {
              userId,
              completed: true,
            },
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          category: true,
          xp: true,
        },
      });

      if (exercise && !recommendations.find(r => r.exercise.id === exercise.id)) {
        recommendations.push({
          exercise,
          reason: `提升薄弱项：${weak.knowledgeKey}`,
          priority: 2,
        });
      }
    }

    // 3. 进阶推荐（已完成简单题，推荐中等题）
    const easyCompleted = await prisma.exerciseProgress.count({
      where: {
        userId,
        completed: true,
        exercise: {
          source: 'EXERCISE_LIBRARY',
          difficulty: 'EASY',
        },
      },
    });

    const easyTotal = await prisma.exercise.count({
      where: {
        source: 'EXERCISE_LIBRARY',
        difficulty: 'EASY',
        isPublished: true,
      },
    });

    if (easyTotal > 0 && easyCompleted / easyTotal > 0.5) {
      const mediumExercise = await prisma.exercise.findFirst({
        where: {
          source: 'EXERCISE_LIBRARY',
          type: 'CODING',
          difficulty: 'MEDIUM',
          isPublished: true,
          progress: {
            none: {
              userId,
              completed: true,
            },
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          category: true,
          xp: true,
        },
      });

      if (mediumExercise && !recommendations.find(r => r.exercise.id === mediumExercise.id)) {
        recommendations.push({
          exercise: mediumExercise,
          reason: '挑战更高难度',
          priority: 3,
        });
      }
    }

    // 4. 随机推荐未完成题目
    if (recommendations.length < limit) {
      const randomExercises = await prisma.exercise.findMany({
        where: {
          source: 'EXERCISE_LIBRARY',
          type: 'CODING',
          isPublished: true,
          progress: {
            none: {
              userId,
              completed: true,
            },
          },
          id: {
            notIn: recommendations.map(r => r.exercise.id),
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          category: true,
          xp: true,
        },
        take: limit - recommendations.length,
      });

      for (const exercise of randomExercises) {
        recommendations.push({
          exercise,
          reason: '继续学习',
          priority: 4,
        });
      }
    }

    // 按优先级排序并限制数量
    recommendations.sort((a, b) => a.priority - b.priority);

    res.json({
      recommendations: recommendations.slice(0, limit),
    });
  } catch (error) {
    next(error);
  }
});

// 通用代码执行（不需要 exerciseId，用于编辑器直接运行）
// 注意：必须放在 /:id 路由之前，否则 'execute' 会被当作 id 参数
router.post('/execute', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { code, stdin = '' } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: '请提供代码' });
    }

    // 调用代码执行服务
    const { executeCode } = await import('../services/cppExec.js');
    const result = await executeCode(code, stdin);

    res.json({
      success: result.status.id === 3, // ACCEPTED
      stdout: result.stdout,
      stderr: result.stderr,
      status: result.status,
      time: result.time,
      memory: result.memory,
      compileOutput: result.compileOutput,
    });
  } catch (error: any) {
    // 如果是网络错误（CppExec 服务不可用）
    if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      return res.status(503).json({
        error: '代码执行服务不可用，请稍后再试',
        details: '无法连接到 CppExec 服务',
      });
    }
    next(error);
  }
});

// 获取所有练习题（支持 source 筛选、搜索、分页）
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const {
      source,
      category,
      difficulty,
      search,
      status,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const where: any = {
      isPublished: true,
    };

    if (source) {
      where.source = source as string;
    }

    if (category && category !== '全部') {
      where.category = category as string;
    }

    if (difficulty && difficulty !== '全部') {
      where.difficulty = (difficulty as string).toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // 状态筛选需要特殊处理
    if (status === 'completed') {
      where.progress = {
        some: {
          userId,
          completed: true,
        },
      };
    } else if (status === 'incomplete') {
      where.progress = {
        none: {
          userId,
          completed: true,
        },
      };
    }

    // 查询总数
    const total = await prisma.exercise.count({ where });

    // 查询数据
    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: [
        { difficulty: 'asc' },
        { orderIndex: 'asc' },
      ],
      skip,
      take: limitNum,
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        category: true,
        xp: true,
        orderIndex: true,
        progress: {
          where: { userId },
          select: {
            completed: true,
            completedCount: true,
          },
        },
      },
    });

    // 格式化返回数据
    const formattedExercises = exercises.map(ex => ({
      id: ex.id,
      title: ex.title,
      description: ex.description,
      difficulty: ex.difficulty,
      category: ex.category,
      xp: ex.xp,
      completed: ex.progress.length > 0 && ex.progress[0].completed,
      completedCount: ex.progress.length > 0 ? ex.progress[0].completedCount : 0,
    }));

    res.json({
      exercises: formattedExercises,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取单个练习题详情
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const exercise = await prisma.exercise.findUnique({
      where: { id: req.params.id },
      include: {
        testCases: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            input: true,
            output: true,
            isHidden: true,
            orderIndex: true,
          },
        },
        progress: {
          where: { userId },
          select: {
            completed: true,
            completedCount: true,
            xpEarned: true,
            code: true,
          },
        },
      },
    });

    if (!exercise) {
      return res.status(404).json({ error: '练习题不存在' });
    }

    // 隐藏测试用例的具体内容
    const testCases = exercise.testCases.map(tc => ({
      id: tc.id,
      orderIndex: tc.orderIndex,
      isHidden: tc.isHidden,
      // 隐藏用例不返回具体内容
      ...(tc.isHidden ? {} : { input: tc.input, output: tc.output }),
    }));

    const userProgress = exercise.progress.length > 0 ? exercise.progress[0] : null;

    res.json({
      ...exercise,
      testCases,
      userProgress: userProgress ? {
        completed: userProgress.completed,
        completedCount: userProgress.completedCount,
        xpEarned: userProgress.xpEarned,
        savedCode: userProgress.code,
      } : null,
    });
  } catch (error) {
    next(error);
  }
});

// 创建练习题（仅管理员/教师）
router.post('/', authenticate, requireRole('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const {
      title,
      description,
      difficulty,
      category,
      starterCode,
      hint,
      solution,
      xp,
      source = 'EXERCISE_LIBRARY',
      testCases,
    } = req.body;

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
        source,
        type: 'CODING',
        testCases: testCases ? {
          create: testCases.map((tc: any, index: number) => ({
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden || false,
            orderIndex: index,
          })),
        } : undefined,
      },
      include: {
        testCases: true,
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
    const { title, description, difficulty, category, starterCode, hint, solution, xp, testCases } = req.body;

    // 如果有测试用例更新，先删除旧的
    if (testCases) {
      await prisma.testCase.deleteMany({
        where: { exerciseId: req.params.id },
      });
    }

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
        ...(testCases && {
          testCases: {
            create: testCases.map((tc: any, index: number) => ({
              input: tc.input,
              output: tc.output,
              isHidden: tc.isHidden || false,
              orderIndex: index,
            })),
          },
        }),
      },
      include: {
        testCases: true,
      },
    });

    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

// 运行代码（不保存结果）
router.post('/:id/run', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { code } = req.body;
    const exerciseId = req.params.id;

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        testCases: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!exercise) {
      return res.status(404).json({ error: '练习题不存在' });
    }

    if (exercise.testCases.length === 0) {
      return res.status(400).json({ error: '该题目没有测试用例' });
    }

    // 调用代码执行服务
    const testCases = exercise.testCases.map(tc => ({
      input: tc.input,
      output: tc.output,
      isHidden: tc.isHidden,
    }));

    const results = await runTestCases(code, testCases);

    const passedCount = results.filter(r => r.passed).length;
    const allPassed = passedCount === results.length;

    res.json({
      success: allPassed,
      message: allPassed ? '所有测试用例通过！' : `通过 ${passedCount}/${results.length} 个测试用例`,
      results,
      allPassed,
      summary: {
        total: results.length,
        passed: passedCount,
        failed: results.length - passedCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 提交答案（保存结果，发放XP）
router.post('/:id/submit', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { code } = req.body;
    const exerciseId = req.params.id;
    const userId = req.user!.id;

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        testCases: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!exercise) {
      return res.status(404).json({ error: '练习题不存在' });
    }

    if (exercise.testCases.length === 0) {
      return res.status(400).json({ error: '该题目没有测试用例' });
    }

    // 调用代码执行服务验证答案
    const testCases = exercise.testCases.map(tc => ({
      input: tc.input,
      output: tc.output,
      isHidden: tc.isHidden,
    }));

    const results = await runTestCases(code, testCases);
    const passedCount = results.filter(r => r.passed).length;
    const allPassed = passedCount === results.length;

    if (!allPassed) {
      // 记录错题
      await prisma.mistakeRecord.upsert({
        where: {
          userId_exerciseId: { userId, exerciseId },
        },
        update: {
          wrongCount: { increment: 1 },
          lastWrongAt: new Date(),
          userAnswer: { code },
          source: 'EXERCISE_LIBRARY',
          status: 'UNREVIEWED',
          correctStreak: 0,
        },
        create: {
          userId,
          exerciseId,
          source: 'EXERCISE_LIBRARY',
          userAnswer: { code },
          wrongCount: 1,
          lastWrongAt: new Date(),
        },
      });

      return res.json({
        correct: false,
        message: `通过 ${passedCount}/${results.length} 个测试用例`,
        results,
        xpEarned: 0,
        isFirstCompletion: false,
      });
    }

    // 答案正确的逻辑
    const existingProgress = await prisma.exerciseProgress.findUnique({
      where: {
        userId_exerciseId: { userId, exerciseId },
      },
    });

    const isFirstCompletion = !existingProgress?.completed;
    let xpEarned = 0;

    if (isFirstCompletion) {
      xpEarned = exercise.xp;
    } else {
      // 重做给 20% XP
      xpEarned = Math.floor(exercise.xp * 0.2);
    }

    // 更新进度
    await prisma.exerciseProgress.upsert({
      where: {
        userId_exerciseId: { userId, exerciseId },
      },
      update: {
        completed: true,
        code,
        completedAt: new Date(),
        completedCount: { increment: 1 },
        xpEarned: { increment: xpEarned },
      },
      create: {
        userId,
        exerciseId,
        completed: true,
        code,
        completedAt: new Date(),
        completedCount: 1,
        xpEarned,
      },
    });

    // 更新用户 XP
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpEarned },
        totalXp: { increment: xpEarned },
      },
    });

    // 如果之前有错题记录，更新状态
    await prisma.mistakeRecord.updateMany({
      where: { userId, exerciseId },
      data: {
        correctStreak: { increment: 1 },
        reviewedAt: new Date(),
      },
    });

    // 检查是否达到掌握标准（连续答对2次）
    const mistakeRecord = await prisma.mistakeRecord.findUnique({
      where: {
        userId_exerciseId: { userId, exerciseId },
      },
    });

    if (mistakeRecord && mistakeRecord.correctStreak >= 2) {
      await prisma.mistakeRecord.update({
        where: { id: mistakeRecord.id },
        data: {
          status: 'MASTERED',
          masteredAt: new Date(),
        },
      });
    }

    res.json({
      correct: true,
      message: isFirstCompletion ? '恭喜完成！' : '再次完成！',
      results,
      xpEarned,
      isFirstCompletion,
      totalXp: user.totalXp,
    });
  } catch (error) {
    next(error);
  }
});

// 保存代码（不提交）
router.post('/:id/save', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { code } = req.body;
    const exerciseId = req.params.id;
    const userId = req.user!.id;

    await prisma.exerciseProgress.upsert({
      where: {
        userId_exerciseId: { userId, exerciseId },
      },
      update: { code },
      create: {
        userId,
        exerciseId,
        code,
      },
    });

    res.json({ message: '代码已保存' });
  } catch (error) {
    next(error);
  }
});

export { router as exerciseRouter };
