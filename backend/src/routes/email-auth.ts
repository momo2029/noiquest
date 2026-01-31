import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { useInviteCode } from './invite.js';

const router = Router();

// 生成6位数字验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 配置邮件发送（模拟，实际项目中需要配置真实的邮件服务）
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

// 发送邮件
async function sendEmail(to: string, code: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: `NOIQuest <${config.email.user}>`,
      to,
      subject: 'NOIQuest - 邮箱验证码',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(to right, #007acc, #005a9e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">NOIQuest</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">信息学奥赛 C++ 训练营</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin: 0 0 20px 0;">你的验证码</h2>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
              <span style="font-size: 32px; font-weight: bold; color: #007acc; letter-spacing: 5px;">${code}</span>
            </div>
            <p style="color: #666; line-height: 1.6; margin: 0;">
              这是你的 NOIQuest 验证码，有效期为 5 分钟。<br/>
              请不要将此验证码泄露给他人。
            </p>
            <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
              如果你没有请求此验证码，请忽略此邮件。
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[邮件发送] 向 ${to} 发送验证码: ${code}`);
    return true;
  } catch (error) {
    console.error('邮件发送失败:', error);
    return false;
  }
}

// 邮箱验证
const emailSchema = z.string().email('邮箱格式不正确');

// 发送验证码
const sendCodeSchema = z.object({
  email: emailSchema,
});

router.post('/send-code', async (req, res, next) => {
  try {
    const { email } = sendCodeSchema.parse(req.body);

    // 检查是否已发送过验证码（限制频率）
    const existingCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingCode) {
      throw new AppError('验证码已发送，请稍后再试', 400);
    }

    // 生成新的验证码
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后过期

    // 保存到数据库
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // 发送邮件
    const sent = await sendEmail(email, code);

    if (sent) {
      res.json({ message: '验证码已发送到你的邮箱' });
    } else {
      // 邮件发送失败，但验证码已保存到数据库
      // 在开发模式下返回验证码，方便测试
      if (config.nodeEnv === 'development') {
        console.log(`[开发模式] 验证码: ${code} (邮箱: ${email})`);
        res.json({
          message: '邮件发送失败，但验证码已生成（开发模式）',
          code: code // 开发模式下返回验证码
        });
      } else {
        throw new AppError('邮件发送失败，请稍后再试', 500);
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('邮箱格式错误', 400));
    }
    next(error);
  }
});

// 注册验证
const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, '密码至少6位'),
  name: z.string().min(1, '姓名不能为空').max(50),
  role: z.enum(['STUDENT', 'TEACHER']).optional(),
  inviteCode: z.string().min(1, '邀请码不能为空'),
});

// 邮箱注册
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role, inviteCode } = registerSchema.parse(req.body);

    // 检查是否需要邀请码
    if (config.invite.required) {
      if (!inviteCode) {
        throw new AppError('注册需要邀请码', 400);
      }

      // 验证邀请码
      const inviteResult = await useInviteCode(inviteCode);
      if (!inviteResult.valid) {
        throw new AppError(inviteResult.error || '邀请码无效', 400);
      }
    }

    // 检查邮箱是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('该邮箱已注册', 400);
    }

    // 生成用户名（使用邮箱前缀）
    const username = email.split('@')[0];

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 激活奖励：新用户注册送宝石
    const ACTIVATION_BONUS_GEMS = 100;

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        role: role || 'STUDENT',
        inviteCode: inviteCode?.toUpperCase(),
        tokenVersion: 1,
        gems: ACTIVATION_BONUS_GEMS, // 邮箱验证激活奖励
      },
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
        tokenVersion: true,
      },
    });

    // 生成 JWT（包含 tokenVersion）
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, tokenVersion: user.tokenVersion },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('输入数据格式错误', 400));
    }
    next(error);
  }
});

// 登录验证
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '密码不能为空'),
});

// 邮箱密码登录
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
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
        password: true,
      },
    });

    if (!user) {
      throw new AppError('邮箱或密码错误', 401);
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new AppError('邮箱或密码错误', 401);
    }

    // 递增 tokenVersion 实现单设备登录
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { tokenVersion: { increment: 1 } },
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
        tokenVersion: true,
      },
    });

    // 生成 JWT（包含 tokenVersion）
    const token = jwt.sign(
      { id: updatedUser.id, username: updatedUser.username, role: updatedUser.role, tokenVersion: updatedUser.tokenVersion },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    res.json({ user: updatedUser, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('输入数据格式错误', 400));
    }
    next(error);
  }
});

// 获取注册配置（是否需要邀请码）
router.get('/config', async (_req, res) => {
  res.json({
    inviteRequired: config.invite.required,
  });
});

export default router;
