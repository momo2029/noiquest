import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// 获取作业列表（教师）
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { classId } = req.query;

    if (req.user!.role === 'TEACHER' || req.user!.role === 'ADMIN') {
      const homework = await prisma.homework.findMany({
        where: {
          teacherId: req.user!.id,
          ...(classId && { classId: classId as string }),
        },
        include: {
          class: { select: { name: true } },
          exercises: {
            include: { exercise: { select: { id: true, title: true } } },
          },
          _count: { select: { students: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json(homework);
    }

    // 学生获取自己的作业
    const studentHomework = await prisma.studentHomework.findMany({
      where: { studentId: req.user!.id },
      include: {
        homework: {
          include: {
            exercises: {
              include: { exercise: { select: { id: true, title: true, difficulty: true } } },
            },
          },
        },
      },
      orderBy: { homework: { dueDate: 'asc' } },
    });

    res.json(studentHomework);
  } catch (error) {
    next(error);
  }
});

// 创建作业
router.post('/', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, description, classId, exerciseIds, dueDate } = req.body;

    if (!title || !classId || !exerciseIds?.length) {
      throw new AppError('请填写完整的作业信息', 400);
    }

    const homework = await prisma.homework.create({
      data: {
        title,
        description,
        classId,
        teacherId: req.user!.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        exercises: {
          create: exerciseIds.map((id: string, index: number) => ({
            exerciseId: id,
            orderIndex: index,
          })),
        },
      },
      include: {
        exercises: {
          include: { exercise: true },
        },
      },
    });

    // 为班级所有学生创建作业记录
    const students = await prisma.user.findMany({
      where: { classId },
      select: { id: true },
    });

    if (students.length > 0) {
      await prisma.studentHomework.createMany({
        data: students.map(s => ({
          studentId: s.id,
          homeworkId: homework.id,
        })),
      });
    }

    res.status(201).json(homework);
  } catch (error) {
    next(error);
  }
});

// 获取作业详情
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const homework = await prisma.homework.findUnique({
      where: { id: req.params.id },
      include: {
        class: { select: { name: true } },
        exercises: {
          include: { exercise: true },
          orderBy: { orderIndex: 'asc' },
        },
        students: {
          include: {
            student: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!homework) {
      throw new AppError('作业不存在', 404);
    }

    res.json(homework);
  } catch (error) {
    next(error);
  }
});

// 提交作业
router.post('/:id/submit', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const studentHomework = await prisma.studentHomework.update({
      where: {
        studentId_homeworkId: {
          studentId: req.user!.id,
          homeworkId: req.params.id,
        },
      },
      data: {
        status: 'completed',
        submittedAt: new Date(),
      },
    });

    res.json(studentHomework);
  } catch (error) {
    next(error);
  }
});

// 批改作业（教师）
router.post('/:id/grade/:studentId', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { score, feedback } = req.body;

    const studentHomework = await prisma.studentHomework.update({
      where: {
        studentId_homeworkId: {
          studentId: req.params.studentId,
          homeworkId: req.params.id,
        },
      },
      data: {
        score,
        feedback,
      },
    });

    res.json(studentHomework);
  } catch (error) {
    next(error);
  }
});

// 删除作业
router.delete('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.homework.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export { router as homeworkRouter };
