import prisma from '../config/database.js';
import { recordTransaction, TransactionSource } from './currencyTransaction.js';

// 教师分成比例
const TEACHER_BONUS_RATE = 0.2; // 20%

/**
 * 给学生的班级教师发放钻石分成
 * @param studentId 学生ID
 * @param gemsEarned 学生获得的钻石数量
 * @param sourceId 来源ID（练习ID、成就ID等）
 * @returns 教师获得的钻石数量（如果有教师的话）
 */
export async function giveTeacherBonus(studentId: string, gemsEarned: number, sourceId?: string): Promise<number> {
  if (gemsEarned <= 0) return 0;

  try {
    // 获取学生信息，包括班级和姓名
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { classId: true, name: true },
    });

    if (!student?.classId) return 0;

    // 获取班级的教师
    const classInfo = await prisma.class.findUnique({
      where: { id: student.classId },
      select: { teacherId: true },
    });

    if (!classInfo?.teacherId) return 0;

    // 计算教师分成（向下取整）
    const teacherBonus = Math.floor(gemsEarned * TEACHER_BONUS_RATE);
    if (teacherBonus <= 0) return 0;

    // 给教师增加钻石
    await prisma.user.update({
      where: { id: classInfo.teacherId },
      data: { gems: { increment: teacherBonus } },
    });

    // 记录交易明细
    await recordTransaction({
      userId: classInfo.teacherId,
      type: 'TRANSFER',
      currency: 'GEMS',
      amount: teacherBonus,
      source: TransactionSource.TEACHER_BONUS,
      sourceId,
      note: `学生 ${student.name} 获得 ${gemsEarned} 宝石的 20% 分成`,
    });

    console.log(`[教师分成] 学生 ${studentId} 获得 ${gemsEarned} 钻石，教师 ${classInfo.teacherId} 获得 ${teacherBonus} 钻石`);

    return teacherBonus;
  } catch (error) {
    console.error('[教师分成] 发放失败:', error);
    return 0;
  }
}
