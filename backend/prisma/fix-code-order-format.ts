/**
 * 修复 CODE_ORDER 题目数据格式
 * 将旧格式 { lines: [{ id, code, order }] } 转换为新格式 { lines: string[], correctOrder: number[] }
 *
 * 用法: npx ts-node prisma/fix-code-order-format.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OldLineFormat {
  id: string;
  code: string;
  order: number;
}

interface OldQuestionData {
  lines: OldLineFormat[];
  explanation?: string;
}

interface NewQuestionData {
  lines: string[];
  correctOrder: number[];
  explanation?: string;
}

async function fixCodeOrderFormat() {
  console.log('========== 修复 CODE_ORDER 数据格式 ==========\n');

  // 查找所有 CODE_ORDER 类型的题目
  const exercises = await prisma.exercise.findMany({
    where: { type: 'CODE_ORDER' },
    select: { id: true, title: true, questionData: true },
  });

  console.log(`找到 ${exercises.length} 道 CODE_ORDER 题目\n`);

  let fixedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const exercise of exercises) {
    const questionData = exercise.questionData as any;

    // 检查是否是旧格式（lines 是对象数组）
    if (!questionData?.lines || !Array.isArray(questionData.lines)) {
      console.log(`⚠ 跳过 "${exercise.title}" - 没有 lines 数据`);
      errorCount++;
      continue;
    }

    // 检查是否已经是新格式（lines 是字符串数组）
    if (typeof questionData.lines[0] === 'string') {
      // 已经是新格式，检查是否有 correctOrder
      if (Array.isArray(questionData.correctOrder)) {
        console.log(`✓ 跳过 "${exercise.title}" - 已是新格式`);
        skippedCount++;
        continue;
      } else {
        // 有 lines 字符串数组但没有 correctOrder，需要添加默认顺序
        const newData: NewQuestionData = {
          lines: questionData.lines,
          correctOrder: questionData.lines.map((_: string, i: number) => i),
          explanation: questionData.explanation,
        };

        await prisma.exercise.update({
          where: { id: exercise.id },
          data: { questionData: newData as any },
        });

        console.log(`✓ 修复 "${exercise.title}" - 添加了 correctOrder`);
        fixedCount++;
        continue;
      }
    }

    // 旧格式：lines 是对象数组 [{ id, code, order }]
    const oldData = questionData as OldQuestionData;

    try {
      // 按 order 排序获取正确顺序
      const sortedLines = [...oldData.lines].sort((a, b) => a.order - b.order);

      // 创建新格式数据
      const newData: NewQuestionData = {
        lines: oldData.lines.map(l => l.code),
        correctOrder: sortedLines.map(l => oldData.lines.findIndex(ol => ol.id === l.id)),
        explanation: oldData.explanation,
      };

      await prisma.exercise.update({
        where: { id: exercise.id },
        data: { questionData: newData as any },
      });

      console.log(`✓ 修复 "${exercise.title}" - 从旧格式转换`);
      fixedCount++;
    } catch (e) {
      console.log(`✗ 错误 "${exercise.title}" - ${e}`);
      errorCount++;
    }
  }

  console.log('\n========== 修复完成 ==========');
  console.log(`修复: ${fixedCount} 道`);
  console.log(`跳过: ${skippedCount} 道`);
  console.log(`错误: ${errorCount} 道`);
}

// 运行
fixCodeOrderFormat()
  .catch((e) => {
    console.error('修复失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
