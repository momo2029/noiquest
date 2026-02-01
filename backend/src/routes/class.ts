import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 获取所有班级（教师）
router.get('/', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const classes = await prisma.class.findMany({
      where: { teacherId: req.user!.id },
      include: {
        _count: { select: { students: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(classes);
  } catch (error) {
    next(error);
  }
});

// 创建班级
router.post('/', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      throw new AppError('班级名称不能为空', 400);
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        teacherId: req.user!.id,
      },
    });

    res.status(201).json(newClass);
  } catch (error) {
    next(error);
  }
});

// 获取班级详情
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const classInfo = await prisma.class.findUnique({
      where: { id: req.params.id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            avatar: true,
            level: true,
            totalXp: true,
            streak: true,
          },
        },
        _count: { select: { homework: true } },
      },
    });

    if (!classInfo) {
      throw new AppError('班级不存在', 404);
    }

    res.json(classInfo);
  } catch (error) {
    next(error);
  }
});

// 获取班级学生列表
router.get('/:id/students', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const students = await prisma.user.findMany({
      where: { classId: req.params.id },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        level: true,
        totalXp: true,
        streak: true,
        hearts: true,
        gems: true,
        _count: {
          select: {
            progress: { where: { completed: true } },
          },
        },
      },
      orderBy: { totalXp: 'desc' },
    });

    res.json(students);
  } catch (error) {
    next(error);
  }
});

// 搜索未分班学生
router.get('/search/students', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.json({ users: [] });
    }

    const keyword = q.trim();

    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        classId: null, // 只搜索未分班的学生
        OR: [
          { email: { contains: keyword, mode: 'insensitive' } },
          { username: { contains: keyword, mode: 'insensitive' } },
          { name: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
      },
      take: 10,
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// 添加学生到班级
router.post('/:id/students', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { studentId } = req.body;
    const classId = req.params.id;

    if (!studentId) {
      throw new AppError('请提供学生ID', 400);
    }

    // 检查学生是否存在
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, classId: true, role: true },
    });

    if (!student) {
      throw new AppError('学生不存在', 404);
    }

    if (student.role !== 'STUDENT') {
      throw new AppError('只能添加学生角色的用户', 400);
    }

    if (student.classId) {
      throw new AppError('该学生已在其他班级，请先将其移出原班级', 400);
    }

    // 验证班级存在且属于当前教师
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInfo) {
      throw new AppError('班级不存在', 404);
    }

    if (classInfo.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('无权操作此班级', 403);
    }

    await prisma.user.update({
      where: { id: studentId },
      data: { classId },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 从班级移除学生
router.delete('/:id/students/:studentId', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.user.update({
      where: { id: req.params.studentId },
      data: { classId: null },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 删除班级
router.delete('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    // 先移除所有学生的班级关联
    await prisma.user.updateMany({
      where: { classId: req.params.id },
      data: { classId: null },
    });

    await prisma.class.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ==================== 班级邀请码管理 ====================

// 获取班级的邀请码列表
router.get('/:id/invite-codes', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const classId = req.params.id;

    // 验证班级存在且属于当前教师
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInfo) {
      throw new AppError('班级不存在', 404);
    }

    if (classInfo.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('无权访问此班级', 403);
    }

    const codes = await prisma.inviteCode.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ codes });
  } catch (error) {
    next(error);
  }
});

// 为班级生成邀请码
router.post('/:id/invite-codes', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const classId = req.params.id;
    const { expiresInDays, maxUses = 50, note } = req.body;

    // 验证班级存在且属于当前教师
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInfo) {
      throw new AppError('班级不存在', 404);
    }

    if (classInfo.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('无权操作此班级', 403);
    }

    // 生成邀请码
    const code = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

    const inviteCode = await prisma.inviteCode.create({
      data: {
        code,
        createdBy: req.user!.id,
        type: 'STUDENT',
        maxUses,
        expiresAt,
        note,
        classId,
      },
    });

    res.status(201).json({
      ...inviteCode,
      className: classInfo.name,
    });
  } catch (error) {
    next(error);
  }
});

// 删除班级邀请码
router.delete('/:id/invite-codes/:codeId', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id: classId, codeId } = req.params;

    // 验证班级存在且属于当前教师
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInfo) {
      throw new AppError('班级不存在', 404);
    }

    if (classInfo.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('无权操作此班级', 403);
    }

    // 验证邀请码属于该班级
    const inviteCode = await prisma.inviteCode.findUnique({
      where: { id: codeId },
    });

    if (!inviteCode || inviteCode.classId !== classId) {
      throw new AppError('邀请码不存在', 404);
    }

    await prisma.inviteCode.delete({
      where: { id: codeId },
    });

    res.json({ success: true, message: '邀请码已删除' });
  } catch (error) {
    next(error);
  }
});

// ==================== 学生错题查看 ====================

// 获取班级学生的错题列表
router.get('/:id/students/:studentId/mistakes', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id: classId, studentId } = req.params;
    const { status, page = '1', limit = '20' } = req.query;

    // 验证班级存在且属于当前教师
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInfo) {
      throw new AppError('班级不存在', 404);
    }

    if (classInfo.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('无权访问此班级', 403);
    }

    // 验证学生属于该班级
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, classId: true },
    });

    if (!student || student.classId !== classId) {
      throw new AppError('学生不存在或不属于该班级', 404);
    }

    // 构建查询条件
    const where: any = { userId: studentId };
    if (status === 'UNREVIEWED' || status === 'REVIEWING' || status === 'MASTERED') {
      where.status = status;
    }

    // 获取错题列表
    const [mistakes, total] = await Promise.all([
      prisma.mistakeRecord.findMany({
        where,
        include: {
          exercise: {
            select: {
              id: true,
              title: true,
              category: true,
              difficulty: true,
            },
          },
        },
        orderBy: { lastWrongAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.mistakeRecord.count({ where }),
    ]);

    res.json({
      student: { id: student.id, name: student.name },
      mistakes,
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

// 获取班级所有学生的错题统计
router.get('/:id/mistakes-summary', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const classId = req.params.id;

    // 验证班级存在且属于当前教师
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInfo) {
      throw new AppError('班级不存在', 404);
    }

    if (classInfo.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('无权访问此班级', 403);
    }

    // 获取班级所有学生的错题统计
    const students = await prisma.user.findMany({
      where: { classId },
      select: {
        id: true,
        name: true,
        avatar: true,
        _count: {
          select: {
            mistakeRecords: true,
          },
        },
      },
    });

    // 获取每个学生的未复习错题数
    const studentsWithMistakes = await Promise.all(
      students.map(async (student) => {
        const unreviewedCount = await prisma.mistakeRecord.count({
          where: { userId: student.id, status: 'UNREVIEWED' },
        });
        return {
          id: student.id,
          name: student.name,
          avatar: student.avatar,
          totalMistakes: student._count.mistakeRecords,
          unreviewedMistakes: unreviewedCount,
        };
      })
    );

    res.json({ students: studentsWithMistakes });
  } catch (error) {
    next(error);
  }
});

export { router as classRouter };
