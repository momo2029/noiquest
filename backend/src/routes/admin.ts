import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
import { generateKnowledgeGraphStatic } from '../services/staticGenerator.js';

const router = Router();

// 所有管理员接口都需要 ADMIN 角色
router.use(authenticate, requireRole('ADMIN'));

// 获取仪表盘概览数据
router.get('/dashboard', async (req: AuthRequest, res: Response, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // 用户统计
    const [totalUsers, studentCount, teacherCount, newUsersToday, newUsersWeek] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    ]);

    // 学习数据统计
    const [totalExercises, totalProgress, completedProgress, totalSubmissions] = await Promise.all([
      prisma.exercise.count(),
      prisma.exerciseProgress.count(),
      prisma.exerciseProgress.count({ where: { completed: true } }),
      prisma.submission.count(),
    ]);

    // 今日活跃用户（有 XP 记录的用户）
    const activeUsersToday = await prisma.dailyXpRecord.count({
      where: { date: today, xpEarned: { gt: 0 } },
    });

    // 技能树数据
    const [totalUnits, totalCourses] = await Promise.all([
      prisma.skillUnit.count(),
      prisma.course.count(),
    ]);

    // 最近7天每日活跃用户趋势
    const dailyActiveUsers = await prisma.$queryRaw`
      SELECT DATE(date) as day, COUNT(DISTINCT "userId") as count
      FROM "DailyXpRecord"
      WHERE date >= ${weekAgo}
      GROUP BY DATE(date)
      ORDER BY day ASC
    ` as { day: Date; count: bigint }[];

    // 最近7天新增用户趋势
    const dailyNewUsers = await prisma.$queryRaw`
      SELECT DATE("createdAt") as day, COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= ${weekAgo}
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    ` as { day: Date; count: bigint }[];

    res.json({
      users: {
        total: totalUsers,
        students: studentCount,
        teachers: teacherCount,
        admins: totalUsers - studentCount - teacherCount,
        newToday: newUsersToday,
        newThisWeek: newUsersWeek,
        activeToday: activeUsersToday,
      },
      content: {
        exercises: totalExercises,
        units: totalUnits,
        courses: totalCourses,
      },
      learning: {
        totalProgress: totalProgress,
        completedProgress: completedProgress,
        completionRate: totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0,
        totalSubmissions: totalSubmissions,
      },
      trends: {
        dailyActiveUsers: dailyActiveUsers.map(d => ({ day: d.day, count: Number(d.count) })),
        dailyNewUsers: dailyNewUsers.map(d => ({ day: d.day, count: Number(d.count) })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取用户列表
router.get('/users', async (req: AuthRequest, res: Response, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { username: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          level: true,
          xp: true,
          totalXp: true,
          streak: true,
          hearts: true,
          gems: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              progress: true,
              submissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users: users.map(u => ({
        ...u,
        progressCount: u._count.progress,
        submissionCount: u._count.submissions,
        _count: undefined,
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

// 获取单个用户详情
router.get('/users/:userId', async (req: AuthRequest, res: Response, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: {
          include: { exercise: { select: { title: true, category: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 20,
        },
        achievements: {
          include: { achievement: true },
        },
        _count: {
          select: {
            progress: true,
            submissions: true,
            mistakeRecords: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 获取用户最近7天的学习数据
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentXp = await prisma.dailyXpRecord.findMany({
      where: { userId, date: { gte: weekAgo } },
      orderBy: { date: 'asc' },
    });

    res.json({
      ...user,
      password: undefined,
      recentXp,
    });
  } catch (error) {
    next(error);
  }
});

// 更新用户信息
router.patch('/users/:userId', async (req: AuthRequest, res: Response, next) => {
  try {
    const { userId } = req.params;
    const { name, role, level, xp, hearts, gems } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(level !== undefined && { level }),
        ...(xp !== undefined && { xp }),
        ...(hearts !== undefined && { hearts }),
        ...(gems !== undefined && { gems }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        level: true,
        xp: true,
        hearts: true,
        gems: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// 删除用户
router.delete('/users/:userId', async (req: AuthRequest, res: Response, next) => {
  try {
    const { userId } = req.params;

    // 不能删除自己
    if (userId === req.user!.id) {
      return res.status(400).json({ error: '不能删除自己的账号' });
    }

    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: '用户已删除' });
  } catch (error) {
    next(error);
  }
});

// 获取练习题列表（管理）
router.get('/exercises', async (req: AuthRequest, res: Response, next) => {
  try {
    const { category, type, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (type) where.type = type;

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        include: {
          unit: { select: { id: true, title: true } },
          lesson: { select: { id: true, title: true } },
          _count: {
            select: {
              progress: true,
              submissions: true,
              mistakeRecords: true,
            },
          },
        },
        orderBy: { orderIndex: 'asc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.exercise.count({ where }),
    ]);

    // 计算每道题的完成率
    const exercisesWithStats = exercises.map(e => {
      const completedCount = e._count.progress;
      return {
        ...e,
        completedCount,
        submissionCount: e._count.submissions,
        mistakeCount: e._count.mistakeRecords,
        _count: undefined,
      };
    });

    res.json({
      exercises: exercisesWithStats,
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

// 获取技能单元列表（管理）
router.get('/units', async (req: AuthRequest, res: Response, next) => {
  try {
    const units = await prisma.skillUnit.findMany({
      include: {
        lessons: {
          include: {
            _count: { select: { exercises: true } },
          },
        },
        _count: {
          select: {
            exercises: true,
            userProgress: true,
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    res.json(units.map(u => ({
      ...u,
      lessonCount: u.lessons.length,
      exerciseCount: u._count.exercises,
      userProgressCount: u._count.userProgress,
    })));
  } catch (error) {
    next(error);
  }
});

// 获取学习数据分析
router.get('/analytics', async (req: AuthRequest, res: Response, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // 每日 XP 总量趋势
    const dailyXpTrend = await prisma.$queryRaw`
      SELECT DATE(date) as day, SUM("xpEarned") as total_xp, COUNT(DISTINCT "userId") as users
      FROM "DailyXpRecord"
      WHERE date >= ${startDate}
      GROUP BY DATE(date)
      ORDER BY day ASC
    ` as { day: Date; total_xp: bigint; users: bigint }[];

    // 分类完成统计
    const categoryStats = await prisma.exercise.groupBy({
      by: ['category'],
      _count: true,
    });

    const categoryProgress = await prisma.exerciseProgress.groupBy({
      by: ['exerciseId'],
      where: { completed: true },
      _count: true,
    });

    // 题型分布
    const typeStats = await prisma.exercise.groupBy({
      by: ['type'],
      _count: true,
    });

    // 难度分布
    const difficultyStats = await prisma.exercise.groupBy({
      by: ['difficulty'],
      _count: true,
    });

    // 用户等级分布
    const levelDistribution = await prisma.user.groupBy({
      by: ['level'],
      where: { role: 'STUDENT' },
      _count: true,
      orderBy: { level: 'asc' },
    });

    // 连续学习天数分布
    const streakDistribution = await prisma.$queryRaw`
      SELECT
        CASE
          WHEN streak = 0 THEN '0天'
          WHEN streak BETWEEN 1 AND 3 THEN '1-3天'
          WHEN streak BETWEEN 4 AND 7 THEN '4-7天'
          WHEN streak BETWEEN 8 AND 14 THEN '8-14天'
          WHEN streak BETWEEN 15 AND 30 THEN '15-30天'
          ELSE '30天以上'
        END as range,
        COUNT(*) as count
      FROM "User"
      WHERE role = 'STUDENT'
      GROUP BY range
      ORDER BY MIN(streak)
    ` as { range: string; count: bigint }[];

    res.json({
      dailyXpTrend: dailyXpTrend.map(d => ({
        day: d.day,
        totalXp: Number(d.total_xp),
        activeUsers: Number(d.users),
      })),
      categoryStats: categoryStats.map(c => ({ category: c.category, count: c._count })),
      typeStats: typeStats.map(t => ({ type: t.type, count: t._count })),
      difficultyStats: difficultyStats.map(d => ({ difficulty: d.difficulty, count: d._count })),
      levelDistribution: levelDistribution.map(l => ({ level: l.level, count: l._count })),
      streakDistribution: streakDistribution.map(s => ({ range: s.range, count: Number(s.count) })),
    });
  } catch (error) {
    next(error);
  }
});

// 获取系统配置
router.get('/settings', async (req: AuthRequest, res: Response, next) => {
  try {
    const configs = await prisma.systemConfig.findMany();
    const settings: Record<string, string> = {};
    configs.forEach(c => {
      settings[c.key] = c.value;
    });
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// 更新系统配置
router.put('/settings', async (req: AuthRequest, res: Response, next) => {
  try {
    const updates = req.body as Record<string, string>;

    for (const [key, value] of Object.entries(updates)) {
      await prisma.systemConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    res.json({ message: '设置已更新' });
  } catch (error) {
    next(error);
  }
});

// 创建公告
router.post('/announcements', async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, content } = req.body;

    await prisma.systemConfig.upsert({
      where: { key: 'announcement' },
      update: { value: JSON.stringify({ title, content, updatedAt: new Date() }) },
      create: { key: 'announcement', value: JSON.stringify({ title, content, updatedAt: new Date() }) },
    });

    res.json({ message: '公告已发布' });
  } catch (error) {
    next(error);
  }
});

// ==================== 班级管理 ====================

// 获取班级列表
router.get('/classes', async (_req: AuthRequest, res: Response, next) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        _count: { select: { students: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      classes: classes.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        teacherId: c.teacherId,
        createdAt: c.createdAt,
        _count: { students: c._count.students },
      })),
    });
  } catch (error) {
    next(error);
  }
});

// 获取班级学生列表
router.get('/classes/:classId/students', async (req: AuthRequest, res: Response, next) => {
  try {
    const { classId } = req.params;

    const students = await prisma.user.findMany({
      where: { classId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        level: true,
        xp: true,
        totalXp: true,
        streak: true,
        createdAt: true,
      },
      orderBy: { totalXp: 'desc' },
    });

    res.json({ students });
  } catch (error) {
    next(error);
  }
});

// 创建班级
router.post('/classes', async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: '班级名称不能为空' });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        teacherId: req.user!.id, // 创建者作为班级教师
      },
    });

    res.status(201).json(newClass);
  } catch (error) {
    next(error);
  }
});

// 更新班级
router.patch('/classes/:classId', async (req: AuthRequest, res: Response, next) => {
  try {
    const { classId } = req.params;
    const { name, description } = req.body;

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    res.json(updatedClass);
  } catch (error) {
    next(error);
  }
});

// 删除班级
router.delete('/classes/:classId', async (req: AuthRequest, res: Response, next) => {
  try {
    const { classId } = req.params;

    // 先将班级内的学生移出班级
    await prisma.user.updateMany({
      where: { classId },
      data: { classId: null },
    });

    // 删除班级
    await prisma.class.delete({ where: { id: classId } });

    res.json({ message: '班级已删除' });
  } catch (error) {
    next(error);
  }
});

// ==================== 知识点学习资料管理 ====================

// 获取知识点学习资料
router.get('/skill-units/:unitId/content', async (req: AuthRequest, res: Response, next) => {
  try {
    const { unitId } = req.params;

    const unit = await prisma.skillUnit.findUnique({
      where: { id: unitId },
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        content: true,
        codeExamples: true,
        videoUrl: true,
        references: true,
        tips: true,
        commonMistakes: true,
        estimatedTime: true,
      },
    });

    if (!unit) {
      return res.status(404).json({ error: '知识点不存在' });
    }

    res.json(unit);
  } catch (error) {
    next(error);
  }
});

// 更新知识点学习资料
router.put('/skill-units/:unitId/content', async (req: AuthRequest, res: Response, next) => {
  try {
    const { unitId } = req.params;
    const {
      content,
      codeExamples,
      videoUrl,
      references,
      tips,
      commonMistakes,
      estimatedTime,
    } = req.body;

    // 检查知识点是否存在
    const existingUnit = await prisma.skillUnit.findUnique({
      where: { id: unitId },
    });

    if (!existingUnit) {
      return res.status(404).json({ error: '知识点不存在' });
    }

    // 更新学习资料
    const updatedUnit = await prisma.skillUnit.update({
      where: { id: unitId },
      data: {
        ...(content !== undefined && { content }),
        ...(codeExamples !== undefined && { codeExamples }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(references !== undefined && { references }),
        ...(tips !== undefined && { tips }),
        ...(commonMistakes !== undefined && { commonMistakes }),
        ...(estimatedTime !== undefined && { estimatedTime }),
      },
      select: {
        id: true,
        code: true,
        title: true,
        content: true,
        codeExamples: true,
        videoUrl: true,
        references: true,
        tips: true,
        commonMistakes: true,
        estimatedTime: true,
      },
    });

    // 异步重新生成静态文件（不阻塞响应）
    generateKnowledgeGraphStatic().catch(err => {
      console.error('[Admin] Failed to regenerate static file:', err);
    });

    res.json(updatedUnit);
  } catch (error) {
    next(error);
  }
});

// 获取所有知识点列表（带学习资料状态）
router.get('/skill-units', async (req: AuthRequest, res: Response, next) => {
  try {
    const { tier, moduleId, hasContent } = req.query;

    const whereClause: any = {};
    if (tier) {
      whereClause.tier = tier;
    }
    if (moduleId) {
      whereClause.moduleId = parseInt(moduleId as string);
    }

    const units = await prisma.skillUnit.findMany({
      where: whereClause,
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        tier: true,
        moduleId: true,
        coreLevel: true,
        content: true,
        estimatedTime: true,
        tips: true,
        commonMistakes: true,
        module: {
          select: { name: true },
        },
      },
      orderBy: [{ tier: 'asc' }, { moduleId: 'asc' }, { orderIndex: 'asc' }],
    });

    // 添加是否有学习内容的标记
    let result = units.map(unit => ({
      ...unit,
      moduleName: unit.module?.name,
      hasContent: !!(unit.content || (unit.tips && unit.tips.length > 0)),
      module: undefined,
    }));

    // 按是否有内容筛选
    if (hasContent === 'true') {
      result = result.filter(u => u.hasContent);
    } else if (hasContent === 'false') {
      result = result.filter(u => !u.hasContent);
    }

    res.json({ units: result });
  } catch (error) {
    next(error);
  }
});

// 手动触发重新生成知识图谱静态文件
router.post('/regenerate-static', async (_req: AuthRequest, res: Response, next) => {
  try {
    await generateKnowledgeGraphStatic();
    res.json({ message: '静态文件已重新生成' });
  } catch (error) {
    next(error);
  }
});

export { router as adminRouter };
