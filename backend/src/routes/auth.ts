import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 注册验证
const registerSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
  name: z.string().min(1).max(50),
  role: z.enum(['STUDENT', 'TEACHER']).optional(),
  classCode: z.string().optional(),
});

// 登录验证
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// 注册
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // 检查用户名是否已存在
    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existing) {
      throw new AppError('用户名已存在', 400);
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'STUDENT',
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        level: true,
        xp: true,
        totalXp: true,
        streak: true,
        hearts: true,
        gems: true,
      },
    });

    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('输入数据格式错误', 400));
    }
    next(error);
  }
});

// 登录
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (!user) {
      throw new AppError('用户名或密码错误', 401);
    }

    // 验证密码
    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      throw new AppError('用户名或密码错误', 401);
    }

    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('输入数据格式错误', 400));
    }
    next(error);
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('未认证', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
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
      },
    });

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
