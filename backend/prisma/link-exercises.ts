import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 课时与练习题的映射关系（基于分类和内容）
const sessionExerciseMapping: Record<string, string[]> = {
  // M1-L01 C++入门与变量
  '第一个C++程序': ['ex-hello-world', 'bug-fix-1'],
  '变量是什么': ['ex-variable-input', 'fill-blank-1'],

  // M1-L02 运算符与表达式
  '算术运算符': ['multiple-choice-1'],

  // M1-L03 输入输出
  'cin与cout': ['matching-1'],

  // M1-L04 分支结构
  'if语句': ['ex-condition'],
  '多分支结构': ['code-order-2'],
  '条件表达式': ['ex-max-value'],

  // M1-L05 循环结构（上）
  'for循环': ['ex-sum-1-to-n', 'fill-blank-2', 'code-order-1', 'bug-fix-2'],
  'while循环': ['ex-prime-check', 'matching-2'],

  // M1-L06 循环结构（下）
  '九九乘法表': ['ex-multiplication-table'],

  // M1-L07 一维数组
  '数组的概念': ['multiple-choice-2'],
  '数组统计': ['ex-array-sum'],

  // M1-L10 递归与结构体 - 算法相关（放到综合练习）
  '综合练习': ['ex-bubble-sort', 'ex-binary-search'],
};

async function linkExercisesToSessions() {
  console.log('开始关联练习题到课时...');

  // 获取所有课时
  const sessions = await prisma.courseSession.findMany();
  console.log('课时总数:', sessions.length);

  // 获取所有练习题
  const exercises = await prisma.exercise.findMany();
  console.log('练习题总数:', exercises.length);

  let linkedCount = 0;

  for (const session of sessions) {
    const exerciseIds = sessionExerciseMapping[session.title];
    if (exerciseIds && exerciseIds.length > 0) {
      for (let i = 0; i < exerciseIds.length; i++) {
        const exerciseId = exerciseIds[i];
        const exercise = exercises.find((e: { id: string }) => e.id === exerciseId);
        if (exercise) {
          try {
            await prisma.sessionExercise.create({
              data: {
                sessionId: session.id,
                exerciseId: exercise.id,
                orderIndex: i + 1,
              },
            });
            linkedCount++;
            console.log('  关联:', session.title, '<-', exercise.title);
          } catch (err) {
            // 可能已存在，忽略
          }
        }
      }
    }
  }

  console.log('\n关联完成，共关联', linkedCount, '条记录');

  // 验证结果
  const sessionsWithExercises = await prisma.courseSession.findMany({
    where: {
      exercises: {
        some: {}
      }
    },
    include: {
      exercises: {
        include: {
          exercise: true
        }
      }
    }
  });

  console.log('\n有练习题的课时:');
  for (const s of sessionsWithExercises) {
    console.log(`  ${s.title}: ${s.exercises.length} 道题`);
  }
}

linkExercisesToSessions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
