import dotenv from 'dotenv';
import path from 'path';

// 根据 NODE_ENV 加载对应的环境文件
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';

// 先尝试加载环境特定文件，再加载默认 .env
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config(); // 加载 .env 作为后备

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  },

  doubao: {
    apiKey: process.env.DOUBAO_API_KEY || '',
    apiUrl: process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: process.env.DOUBAO_MODEL || 'ep-20250106161733-w2w9w',
  },

  // AI 调用限制
  ai: {
    dailyLimit: parseInt(process.env.AI_DAILY_LIMIT || '100', 10),  // 每日调用次数限制
  },

  // 邀请码配置
  invite: {
    required: process.env.INVITE_REQUIRED !== 'false',  // 是否需要邀请码注册，默认需要
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 1000, // 每个 IP 最多 1000 次请求
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.qq.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },

  cppExec: {
    url: process.env.CPPEXEC || 'http://localhost:4002',
    apiKey: process.env.CPPEXEC_KEY || '',
    timeout: parseInt(process.env.CPPEXEC_TIMEOUT || '30000', 10),
  },
};
