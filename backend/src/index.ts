import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import emailAuthRouter from './routes/email-auth.js';
import { userRouter } from './routes/user.js';
import { exerciseRouter } from './routes/exercise.js';
import { progressRouter } from './routes/progress.js';
import { aiRouter } from './routes/ai.js';
import { classRouter } from './routes/class.js';
import { homeworkRouter } from './routes/homework.js';
import { statsRouter } from './routes/stats.js';
import { skillTreeRouter } from './routes/skillTree.js';
import { questionsRouter } from './routes/questions.js';
import { dailyRouter } from './routes/daily.js';
import { reviewRouter } from './routes/review.js';
import { adminRouter } from './routes/admin.js';
import { inviteRouter } from './routes/invite.js';
import { adminContentRouter } from './routes/admin-content.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { achievementsRouter } from './routes/achievements.js';
import { analyticsRouter } from './routes/analytics.js';
import { adminStatisticsRouter } from './routes/admin-statistics.js';
import { remindersRouter } from './routes/reminders.js';

const app = express();

// 信任代理（用于处理 X-Forwarded-For 头部）
app.set('trust proxy', true);

// 安全中间件
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// 压缩响应
app.use(compression());

// 解析 JSON
app.use(express.json({ limit: '10mb' }));

// 调试中间件 - 记录所有请求
if (config.debug) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('  Query:', req.query);
    console.log('  Body:', req.body);
    next();
  });
}

// 速率限制
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: '请求过于频繁，请稍后再试' },
  validate: { trustProxy: false },
});
app.use(limiter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/auth', authRouter);
app.use('/api/email-auth', emailAuthRouter);
app.use('/api/users', userRouter);
app.use('/api/exercises', exerciseRouter);
app.use('/api/progress', progressRouter);
app.use('/api/ai', aiRouter);
app.use('/api/classes', classRouter);
app.use('/api/homework', homeworkRouter);
app.use('/api/stats', statsRouter);
app.use('/api/skill-tree', skillTreeRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/daily', dailyRouter);
app.use('/api/review', reviewRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/content', adminContentRouter);
app.use('/api/invite', inviteRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin/statistics', adminStatisticsRouter);
app.use('/api/reminders', remindersRouter);

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(config.port, () => {
  console.log(`🚀 NOI Studio 服务器运行在 http://localhost:${config.port}`);
  console.log(`📊 环境: ${config.nodeEnv}`);
});

export default app;
