import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { recordTransaction, TransactionSource } from '../utils/currencyTransaction.js';

const router = Router();

// 复习间隔（天）- 基于遗忘曲线
const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30];

// 计算下次复习时间
function calculateNextReview(reviewCount: number, correct: boolean): Date {
  const now = new Date();
  let level = reviewCount;

  if (!correct) {
    level = Math.max(0, level - 1); // 答错降级
  } else if (level < REVIEW_INTERVALS.length - 1) {
    level++; // 答对升级
  }

  const days = REVIEW_INTERVALS[Math.min(level, REVIEW_INTERVALS.length - 1)];
  now.setDate(now.getDate() + days);
  return now;
}

// 获取复习状态
router.get('/status', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const now = new Date();

    // 获取待复习的知识点数量
    const dueCount = await prisma.knowledgeMastery.count({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
    });

    // 获取错题数量
    const mistakeCount = await prisma.mistakeRecord.count({
      where: {
        userId,
        status: 'UNREVIEWED',
      },
    });

    // 获取知识点掌握度统计
    const masteryStats = await prisma.knowledgeMastery.groupBy({
      by: ['knowledgeType'],
      where: { userId },
      _avg: { masteryLevel: true },
      _count: true,
    });

    // 获取薄弱知识点（掌握度低于 60%）
    const weakPoints = await prisma.knowledgeMastery.findMany({
      where: {
        userId,
        masteryLevel: { lt: 60 },
      },
      orderBy: { masteryLevel: 'asc' },
      take: 5,
    });

    res.json({
      dueCount,
      mistakeCount,
      totalReviewItems: dueCount + mistakeCount,
      masteryStats: masteryStats.map(s => ({
        type: s.knowledgeType,
        avgMastery: Math.round(s._avg.masteryLevel || 0),
        count: s._count,
      })),
      weakPoints: weakPoints.map(w => ({
        key: w.knowledgeKey,
        type: w.knowledgeType,
        masteryLevel: w.masteryLevel,
        lastReviewedAt: w.lastReviewedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// 获取待复习内容
router.get('/due', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const { limit = 10 } = req.query;

    // 获取待复习的知识点
    const dueKnowledge = await prisma.knowledgeMastery.findMany({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
      orderBy: { nextReviewAt: 'asc' },
      take: Number(limit),
    });

    // 获取未复习的错题
    const mistakes = await prisma.mistakeRecord.findMany({
      where: {
        userId,
        status: 'UNREVIEWED',
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            difficulty: true,
            xp: true,
          },
        },
      },
      orderBy: { wrongCount: 'desc' },
      take: Number(limit),
    });

    // 根据知识点获取相关练习
    const knowledgeExercises = [];
    for (const knowledge of dueKnowledge) {
      let exercises;
      if (knowledge.knowledgeType === 'category') {
        exercises = await prisma.exercise.findMany({
          where: { category: knowledge.knowledgeKey },
          take: 3,
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            difficulty: true,
            xp: true,
          },
        });
      } else if (knowledge.knowledgeType === 'unit') {
        // 通过 SessionExercise 关联查找单元相关的练习
        const sessionExercises = await prisma.sessionExercise.findMany({
          where: {
            session: {
              course: {
                units: {
                  some: { unitId: knowledge.knowledgeKey },
                },
              },
            },
          },
          include: {
            exercise: {
              select: {
                id: true,
                title: true,
                type: true,
                category: true,
                difficulty: true,
                xp: true,
              },
            },
          },
          take: 3,
        });
        exercises = sessionExercises.map(se => se.exercise);
      }

      if (exercises && exercises.length > 0) {
        knowledgeExercises.push({
          knowledge: {
            key: knowledge.knowledgeKey,
            type: knowledge.knowledgeType,
            masteryLevel: knowledge.masteryLevel,
          },
          exercises,
        });
      }
    }

    res.json({
      knowledgeReview: knowledgeExercises,
      mistakeReview: mistakes.map(m => ({
        id: m.id,
        exercise: m.exercise,
        wrongCount: m.wrongCount,
        userAnswer: m.userAnswer,
        correctAnswer: m.correctAnswer,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// 开始复习会话
router.post('/start', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { type = 'mixed', limit = 10 } = req.body;
    const now = new Date();

    let exercises: any[] = [];

    if (type === 'mistakes' || type === 'mixed') {
      // 获取错题
      const mistakes = await prisma.mistakeRecord.findMany({
        where: { userId, status: 'UNREVIEWED' },
        include: { exercise: true },
        take: type === 'mistakes' ? Number(limit) : Math.floor(Number(limit) / 2),
        orderBy: { wrongCount: 'desc' },
      });

      exercises.push(...mistakes.map(m => ({
        ...m.exercise,
        reviewType: 'mistake',
        mistakeRecordId: m.id,
      })));
    }

    if (type === 'knowledge' || type === 'mixed') {
      // 获取待复习知识点的练习
      const dueKnowledge = await prisma.knowledgeMastery.findMany({
        where: { userId, nextReviewAt: { lte: now } },
        take: 5,
      });

      for (const knowledge of dueKnowledge) {
        let knowledgeExercises;
        if (knowledge.knowledgeType === 'category') {
          knowledgeExercises = await prisma.exercise.findMany({
            where: { category: knowledge.knowledgeKey },
            take: 2,
          });
        } else {
          // 通过 SessionExercise 关联查找单元相关的练习
          const sessionExercises = await prisma.sessionExercise.findMany({
            where: {
              session: {
                course: {
                  units: {
                    some: { unitId: knowledge.knowledgeKey },
                  },
                },
              },
            },
            include: { exercise: true },
            take: 2,
          });
          knowledgeExercises = sessionExercises.map(se => se.exercise);
        }

        exercises.push(...knowledgeExercises.map(e => ({
          ...e,
          reviewType: 'knowledge',
          knowledgeKey: knowledge.knowledgeKey,
        })));
      }
    }

    // 打乱顺序
    exercises = exercises.sort(() => Math.random() - 0.5).slice(0, Number(limit));

    res.json({
      sessionId: `review-${Date.now()}`,
      exercises,
      totalCount: exercises.length,
    });
  } catch (error) {
    next(error);
  }
});

// 完成复习
router.post('/complete', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { results } = req.body;
    // results: [{ exerciseId, correct, reviewType, mistakeRecordId?, knowledgeKey? }]

    let totalXp = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    for (const result of results) {
      if (result.correct) {
        correctCount++;
        totalXp += 5; // 复习正确获得 5 XP
      } else {
        incorrectCount++;
      }

      // 更新错题记录
      if (result.reviewType === 'mistake' && result.mistakeRecordId) {
        if (result.correct) {
          await prisma.mistakeRecord.update({
            where: { id: result.mistakeRecordId },
            data: {
              status: 'MASTERED',
              reviewedAt: new Date(),
              correctStreak: { increment: 1 },
            },
          });
        } else {
          await prisma.mistakeRecord.update({
            where: { id: result.mistakeRecordId },
            data: {
              wrongCount: { increment: 1 },
              correctStreak: 0,
            },
          });
        }
      }

      // 更新知识点掌握度
      if (result.knowledgeKey) {
        const mastery = await prisma.knowledgeMastery.findUnique({
          where: { userId_knowledgeKey: { userId, knowledgeKey: result.knowledgeKey } },
        });

        if (mastery) {
          const newMasteryLevel = result.correct
            ? Math.min(100, mastery.masteryLevel + 5)
            : Math.max(0, mastery.masteryLevel - 10);

          await prisma.knowledgeMastery.update({
            where: { id: mastery.id },
            data: {
              masteryLevel: newMasteryLevel,
              lastReviewedAt: new Date(),
              nextReviewAt: calculateNextReview(mastery.reviewCount, result.correct),
              reviewCount: { increment: 1 },
              correctCount: result.correct ? { increment: 1 } : undefined,
              incorrectCount: !result.correct ? { increment: 1 } : undefined,
            },
          });
        }
      }

      // 获取练习的分类，更新分类掌握度
      const exercise = await prisma.exercise.findUnique({
        where: { id: result.exerciseId },
        select: { category: true },
      });

      if (exercise) {
        // 更新分类掌握度
        await prisma.knowledgeMastery.upsert({
          where: { userId_knowledgeKey: { userId, knowledgeKey: exercise.category } },
          update: {
            masteryLevel: result.correct ? { increment: 2 } : { decrement: 5 },
            lastReviewedAt: new Date(),
            reviewCount: { increment: 1 },
            correctCount: result.correct ? { increment: 1 } : undefined,
            incorrectCount: !result.correct ? { increment: 1 } : undefined,
          },
          create: {
            userId,
            knowledgeKey: exercise.category,
            knowledgeType: 'category',
            masteryLevel: result.correct ? 52 : 45,
            lastReviewedAt: new Date(),
            nextReviewAt: calculateNextReview(0, result.correct),
            reviewCount: 1,
            correctCount: result.correct ? 1 : 0,
            incorrectCount: result.correct ? 0 : 1,
          },
        });
      }
    }

    // 更新用户 XP
    if (totalXp > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: totalXp },
          totalXp: { increment: totalXp },
        },
      });

      // 记录经验值交易明细
      await recordTransaction({
        userId,
        type: 'EARN',
        currency: 'XP',
        amount: totalXp,
        source: TransactionSource.REVIEW_COMPLETE,
        note: `复习完成: ${correctCount}/${results.length} 正确`,
      });

      // 更新每日 XP 记录
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.dailyXpRecord.upsert({
        where: { userId_date: { userId, date: today } },
        update: { xpEarned: { increment: totalXp } },
        create: {
          userId,
          date: today,
          xpEarned: totalXp,
          goalMet: false,
        },
      });

      // 更新复习任务进度
      await prisma.userDailyQuest.updateMany({
        where: {
          userId,
          date: today,
          completed: false,
        },
        data: {
          currentValue: { increment: results.length },
        },
      });
    }

    res.json({
      message: '复习完成',
      correctCount,
      incorrectCount,
      accuracy: Math.round((correctCount / results.length) * 100),
      xpEarned: totalXp,
    });
  } catch (error) {
    next(error);
  }
});

// 获取错题本
router.get('/mistakes', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { category, reviewed, page = 1, limit = 20 } = req.query;

    const where: any = { userId };
    if (reviewed !== undefined) {
      where.status = reviewed === 'true' ? 'MASTERED' : 'UNREVIEWED';
    }

    const mistakes = await prisma.mistakeRecord.findMany({
      where,
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            category: true,
            difficulty: true,
            questionData: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { wrongCount: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    // 按分类过滤
    let filteredMistakes = mistakes;
    if (category) {
      filteredMistakes = mistakes.filter(m => m.exercise.category === category);
    }

    const total = await prisma.mistakeRecord.count({ where });

    res.json({
      mistakes: filteredMistakes.map(m => ({
        id: m.id,
        exercise: m.exercise,
        userAnswer: m.userAnswer,
        correctAnswer: m.correctAnswer,
        wrongCount: m.wrongCount,
        status: m.status,
        reviewedAt: m.reviewedAt,
        createdAt: m.createdAt,
      })),
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

// 标记错题为已复习
router.post('/mistakes/:mistakeId/review', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { mistakeId } = req.params;
    const userId = req.user!.id;

    const mistake = await prisma.mistakeRecord.findUnique({
      where: { id: mistakeId },
    });

    if (!mistake) {
      return res.status(404).json({ error: '错题记录不存在' });
    }

    if (mistake.userId !== userId) {
      return res.status(403).json({ error: '无权操作此记录' });
    }

    await prisma.mistakeRecord.update({
      where: { id: mistakeId },
      data: {
        status: 'MASTERED',
        reviewedAt: new Date(),
      },
    });

    res.json({ message: '已标记为已复习' });
  } catch (error) {
    next(error);
  }
});

// 获取知识点掌握度详情
router.get('/mastery', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { type } = req.query;

    const where: any = { userId };
    if (type) {
      where.knowledgeType = type;
    }

    const mastery = await prisma.knowledgeMastery.findMany({
      where,
      orderBy: { masteryLevel: 'asc' },
    });

    res.json(mastery.map(m => ({
      key: m.knowledgeKey,
      type: m.knowledgeType,
      masteryLevel: m.masteryLevel,
      reviewCount: m.reviewCount,
      correctCount: m.correctCount,
      incorrectCount: m.incorrectCount,
      accuracy: m.reviewCount > 0
        ? Math.round((m.correctCount / m.reviewCount) * 100)
        : 0,
      lastReviewedAt: m.lastReviewedAt,
      nextReviewAt: m.nextReviewAt,
    })));
  } catch (error) {
    next(error);
  }
});

export { router as reviewRouter };
