import prisma from '../config/database.js';
import { TransactionType, CurrencyType } from '@prisma/client';

interface RecordTransactionParams {
  userId: string;
  type: TransactionType;
  currency: CurrencyType;
  amount: number;
  source: string;
  sourceId?: string;
  note?: string;
}

/**
 * 记录货币交易明细
 * @returns 交易记录
 */
export async function recordTransaction(params: RecordTransactionParams) {
  const { userId, type, currency, amount, source, sourceId, note } = params;

  // 获取用户当前余额
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { gems: true, totalXp: true },
  });

  if (!user) {
    throw new Error('用户不存在');
  }

  // 计算交易后余额
  const currentBalance = currency === 'GEMS' ? user.gems : user.totalXp;
  const newBalance = currentBalance + amount;

  // 创建交易记录
  const transaction = await prisma.currencyTransaction.create({
    data: {
      userId,
      type,
      currency,
      amount,
      balance: newBalance,
      source,
      sourceId,
      note,
    },
  });

  return transaction;
}

// 常用来源常量
export const TransactionSource = {
  EXERCISE_COMPLETE: 'EXERCISE_COMPLETE',     // 完成练习
  SESSION_COMPLETE: 'SESSION_COMPLETE',       // 完成课时
  ACHIEVEMENT_UNLOCK: 'ACHIEVEMENT_UNLOCK',   // 解锁成就
  DAILY_QUEST: 'DAILY_QUEST',                 // 每日任务
  TEACHER_BONUS: 'TEACHER_BONUS',             // 教师分成
  STREAK_BONUS: 'STREAK_BONUS',               // 连续学习奖励
  REDEEM_CODE: 'REDEEM_CODE',                 // 兑换码
  WITHDRAW: 'WITHDRAW',                       // 提现
  PURCHASE: 'PURCHASE',                       // 购买道具
  HEART_REFILL: 'HEART_REFILL',               // 补充生命值
  EMAIL_VERIFY: 'EMAIL_VERIFY',               // 邮箱验证奖励
  REGISTER_BONUS: 'REGISTER_BONUS',           // 注册奖励
  REVIEW_COMPLETE: 'REVIEW_COMPLETE',         // 复习完成
} as const;
