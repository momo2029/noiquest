import jwt from 'jsonwebtoken';
import { config } from '../../src/config/index.js';

/**
 * 生成测试用 JWT token
 */
export function generateTestToken(userId: string, role: string = 'STUDENT', username: string = 'testuser') {
  return jwt.sign(
    { id: userId, username, role },
    config.jwt.secret,
    { expiresIn: '1h' }
  );
}

/**
 * 创建带认证头的请求选项
 */
export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
