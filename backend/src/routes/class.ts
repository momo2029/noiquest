import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

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

// 添加学生到班级
router.post('/:id/students', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { studentId } = req.body;

    await prisma.user.update({
      where: { id: studentId },
      data: { classId: req.params.id },
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

export { router as classRouter };
