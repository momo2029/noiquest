import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { authRouter } from '../../src/routes/auth.js';
import emailAuthRouter from '../../src/routes/email-auth.js';
import { userRouter } from '../../src/routes/user.js';
import { exerciseRouter } from '../../src/routes/exercise.js';
import { progressRouter } from '../../src/routes/progress.js';
import { aiRouter } from '../../src/routes/ai.js';
import { classRouter } from '../../src/routes/class.js';
import { homeworkRouter } from '../../src/routes/homework.js';
import { statsRouter } from '../../src/routes/stats.js';
import { skillTreeRouter } from '../../src/routes/skillTree.js';
import { questionsRouter } from '../../src/routes/questions.js';
import { dailyRouter } from '../../src/routes/daily.js';
import { reviewRouter } from '../../src/routes/review.js';
import { adminRouter } from '../../src/routes/admin.js';
import { adminContentRouter } from '../../src/routes/admin-content.js';
import { coursesRouter } from '../../src/routes/courses.js';
import { userFilesRouter } from '../../src/routes/user-files.js';
import { heartsRouter } from '../../src/routes/hearts.js';
import { gemsRouter } from '../../src/routes/gems.js';
import { streakRouter } from '../../src/routes/streak.js';
import { achievementsRouter } from '../../src/routes/achievements.js';
import { leaderboardRouter } from '../../src/routes/leaderboard.js';
import { inviteRouter } from '../../src/routes/invite.js';
import { redeemRouter } from '../../src/routes/redeem.js';
import { remindersRouter } from '../../src/routes/reminders.js';
import { analyticsRouter } from '../../src/routes/analytics.js';
import { adminStatisticsRouter } from '../../src/routes/admin-statistics.js';

/**
 * 创建测试用 Express 应用实例（不启动服务器）
 */
export function createTestApp() {
  const app = express();

  // 安全中间件
  app.use(helmet());

  // CORS 配置
  app.use(cors({
    origin: '*',
    credentials: true,
  }));

  // 压缩响应
  app.use(compression());

  // 解析 JSON
  app.use(express.json({ limit: '10mb' }));

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
  app.use('/api/courses', coursesRouter);
  app.use('/api/user-files', userFilesRouter);
  app.use('/api/hearts', heartsRouter);
  app.use('/api/gems', gemsRouter);
  app.use('/api/streak', streakRouter);
  app.use('/api/achievements', achievementsRouter);
  app.use('/api/leaderboard', leaderboardRouter);
  app.use('/api/invite', inviteRouter);
  app.use('/api/redeem', redeemRouter);
  app.use('/api/reminders', remindersRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/admin/statistics', adminStatisticsRouter);

  // 错误处理
  app.use(errorHandler);

  return app;
}
