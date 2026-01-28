import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { runTestCases, StatusCode } from '../services/cppExec.js';

const router = Router();

// 获取题目（含类型数据）
router.get('/:exerciseId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { exerciseId } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        unit: {
          select: { id: true, title: true, icon: true },
        },
        lesson: {
          select: { id: true, title: true },
        },
      },
    });

    if (!exercise) {
      return res.status(404).json({ error: '题目不存在' });
    }

    // 获取用户进度
    const userId = req.user!.id;
    const progress = await prisma.exerciseProgress.findUnique({
      where: { userId_exerciseId: { userId, exerciseId } },
    });

    res.json({
      ...exercise,
      userProgress: progress ? {
        completed: progress.completed,
        code: progress.code,
        completedAt: progress.completedAt,
      } : null,
    });
  } catch (error) {
    next(error);
  }
});

// 提交答案
router.post('/:exerciseId/answer', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { exerciseId } = req.params;
    const { answer, lessonId } = req.body;
    const userId = req.user!.id;

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return res.status(404).json({ error: '题目不存在' });
    }

    let isCorrect = false;
    let feedback = '';
    let correctAnswer: any = null;

    // 根据题型验证答案
    switch (exercise.type) {
      case 'FILL_BLANK': {
        const questionData = exercise.questionData as any;
        const blanks = questionData?.blanks || [];
        const userAnswers = answer as Record<string, string>;

        let allCorrect = true;
        const blankResults: Record<string, { correct: boolean; expected: string }> = {};

        for (const blank of blanks) {
          const userAnswer = userAnswers[blank.id]?.trim();
          const alternatives = blank.alternatives || [blank.answer];
          const correct = alternatives.some((alt: string) =>
            alt.toLowerCase() === userAnswer?.toLowerCase()
          );

          blankResults[blank.id] = {
            correct,
            expected: blank.answer,
          };

          if (!correct) allCorrect = false;
        }

        isCorrect = allCorrect;
        correctAnswer = blankResults;
        feedback = isCorrect ? '所有填空都正确！' : '部分填空不正确，请检查。';
        break;
      }

      case 'CODE_ORDER': {
        const questionData = exercise.questionData as any;
        const correctOrder = questionData?.lines?.map((l: any) => l.id).sort((a: string, b: string) => {
          const lineA = questionData.lines.find((l: any) => l.id === a);
          const lineB = questionData.lines.find((l: any) => l.id === b);
          return lineA.order - lineB.order;
        });

        const userOrder = answer as string[];
        isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder);
        correctAnswer = correctOrder;
        feedback = isCorrect ? '代码顺序正确！' : '代码顺序不正确，请重新排列。';
        break;
      }

      case 'MULTIPLE_CHOICE': {
        const questionData = exercise.questionData as any;
        const correctOption = questionData?.options?.find((o: any) => o.correct);
        isCorrect = answer === correctOption?.id;
        correctAnswer = correctOption?.id;
        feedback = isCorrect
          ? '回答正确！'
          : `回答错误。${questionData?.explanation || ''}`;
        break;
      }

      case 'MATCHING': {
        const questionData = exercise.questionData as any;
        const correctPairs = questionData?.pairs || [];
        const userPairs = answer as [string, string][];

        // 检查每个配对是否正确
        let allCorrect = true;
        for (const [left, right] of userPairs) {
          const isMatch = correctPairs.some(
            (pair: [string, string]) => pair[0] === left && pair[1] === right
          );
          if (!isMatch) {
            allCorrect = false;
            break;
          }
        }

        isCorrect = allCorrect && userPairs.length === correctPairs.length;
        correctAnswer = correctPairs;
        feedback = isCorrect ? '配对全部正确！' : '部分配对不正确，请重试。';
        break;
      }

      case 'BUG_FIX': {
        const questionData = exercise.questionData as any;
        const bugs = questionData?.bugs || [];
        const userFixes = answer as Record<number, string>;

        let allCorrect = true;
        const bugResults: Record<number, { correct: boolean; expected: string }> = {};

        for (const bug of bugs) {
          const userFix = userFixes[bug.line]?.trim();
          const correct = userFix === bug.fix.trim();

          bugResults[bug.line] = {
            correct,
            expected: bug.fix,
          };

          if (!correct) allCorrect = false;
        }

        isCorrect = allCorrect;
        correctAnswer = bugResults;
        feedback = isCorrect ? '所有错误都修复正确！' : '部分修复不正确，请检查。';
        break;
      }

      case 'CODING': {
        // 编程题需要通过代码执行来验证
        const questionData = exercise.questionData as any;
        const userCode = typeof answer === 'string' ? answer : answer?.code;

        // 检查是否提交了有效代码
        if (!userCode || !userCode.trim()) {
          isCorrect = false;
          feedback = '请编写代码后再提交';
          break;
        }

        // 检查代码是否与初始代码相同（没有修改）
        if (exercise.starterCode && userCode.trim() === exercise.starterCode.trim()) {
          isCorrect = false;
          feedback = '请修改初始代码后再提交';
          break;
        }

        // 如果有测试用例，使用代码执行服务验证
        if (questionData?.testCases && questionData.testCases.length > 0) {
          try {
            const testCases = questionData.testCases.map((tc: any) => ({
              input: tc.input || '',
              output: tc.output || tc.expected || '',
              isHidden: tc.isHidden || false,
            }));

            const results = await runTestCases(userCode, testCases);
            const passedCount = results.filter(r => r.passed).length;
            const allPassed = passedCount === results.length;

            isCorrect = allPassed;

            if (allPassed) {
              feedback = '所有测试用例通过！';
            } else {
              // 找到第一个失败的测试用例
              const firstFailed = results.find(r => !r.passed);
              if (firstFailed) {
                if (firstFailed.status.id === StatusCode.COMPILATION_ERROR) {
                  feedback = `编译错误：${firstFailed.compileOutput || '请检查代码语法'}`;
                } else if (firstFailed.status.id === StatusCode.TIME_LIMIT_EXCEEDED) {
                  feedback = `测试用例 ${firstFailed.testCase} 超时`;
                } else if (firstFailed.status.id === StatusCode.RUNTIME_ERROR_SIGSEGV) {
                  feedback = `测试用例 ${firstFailed.testCase} 运行时错误（段错误）`;
                } else if (firstFailed.status.id === StatusCode.WRONG_ANSWER) {
                  feedback = `测试用例 ${firstFailed.testCase} 答案错误`;
                } else {
                  feedback = `通过 ${passedCount}/${results.length} 个测试用例`;
                }
              } else {
                feedback = `通过 ${passedCount}/${results.length} 个测试用例`;
              }
            }

            correctAnswer = { results, passedCount, total: results.length };
          } catch (error) {
            isCorrect = false;
            feedback = '代码执行服务暂时不可用，请稍后再试';
            correctAnswer = { error: error instanceof Error ? error.message : 'Unknown error' };
          }
        } else {
          // 没有测试用例的编程题，检查代码是否包含基本结构
          const hasMainFunction = userCode.includes('main');
          const hasOutput = userCode.includes('cout') || userCode.includes('printf') || userCode.includes('print');

          if (!hasMainFunction) {
            isCorrect = false;
            feedback = '代码缺少 main 函数';
          } else if (!hasOutput) {
            isCorrect = false;
            feedback = '代码缺少输出语句';
          } else {
            // 基本结构检查通过
            isCorrect = true;
            feedback = '代码结构正确！';
          }
        }
        break;
      }

      default: {
        isCorrect = false;
        feedback = '未知题型';
        break;
      }
    }

    // 更新练习进度
    if (isCorrect) {
      const existingProgress = await prisma.exerciseProgress.findUnique({
        where: { userId_exerciseId: { userId, exerciseId } },
      });

      const isFirstCompletion = !existingProgress?.completed;

      await prisma.exerciseProgress.upsert({
        where: { userId_exerciseId: { userId, exerciseId } },
        update: {
          completed: true,
          completedAt: new Date(),
          code: typeof answer === 'string' ? answer : JSON.stringify(answer),
        },
        create: {
          userId,
          exerciseId,
          completed: true,
          completedAt: new Date(),
          code: typeof answer === 'string' ? answer : JSON.stringify(answer),
        },
      });

      // 首次完成给予 XP
      if (isFirstCompletion) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: exercise.xp },
            totalXp: { increment: exercise.xp },
          },
        });

        // 更新每日 XP 记录
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.dailyXpRecord.upsert({
          where: { userId_date: { userId, date: today } },
          update: { xpEarned: { increment: exercise.xp } },
          create: {
            userId,
            date: today,
            xpEarned: exercise.xp,
            goalMet: false,
          },
        });

        // 更新每日任务进度
        const questTemplates = await prisma.dailyQuestTemplate.findMany({
          where: { questType: 'complete_exercises' },
          select: { id: true },
        });
        await prisma.userDailyQuest.updateMany({
          where: {
            userId,
            date: today,
            templateId: { in: questTemplates.map(t => t.id) },
            completed: false,
          },
          data: {
            currentValue: { increment: 1 },
          },
        });
      }
    } else {
      // 记录错题
      await prisma.mistakeRecord.upsert({
        where: { userId_exerciseId: { userId, exerciseId } },
        update: {
          userAnswer: answer,
          correctAnswer,
          wrongCount: { increment: 1 },
          lastWrongAt: new Date(),
          status: 'UNREVIEWED',
        },
        create: {
          userId,
          exerciseId,
          userAnswer: answer,
          correctAnswer,
          wrongCount: 1,
          lastWrongAt: new Date(),
          status: 'UNREVIEWED',
        },
      });

      // 更新课程错误计数
      if (lessonId) {
        await prisma.userLessonProgress.updateMany({
          where: { userId, lessonId },
          data: { mistakes: { increment: 1 } },
        });
      }
    }

    res.json({
      correct: isCorrect,
      feedback,
      correctAnswer: isCorrect ? null : correctAnswer,
      xpEarned: isCorrect ? exercise.xp : 0,
    });
  } catch (error) {
    next(error);
  }
});

// 获取提示
router.get('/:exerciseId/hint', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { exerciseId } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: {
        hint: true,
        type: true,
        questionData: true,
      },
    });

    if (!exercise) {
      return res.status(404).json({ error: '题目不存在' });
    }

    let hints: string[] = [];

    if (exercise.hint) {
      hints.push(exercise.hint);
    }

    // 根据题型提供额外提示
    const questionData = exercise.questionData as any;
    if (questionData) {
      switch (exercise.type) {
        case 'FILL_BLANK':
          questionData.blanks?.forEach((blank: any) => {
            if (blank.hint) hints.push(`填空 ${blank.id}: ${blank.hint}`);
          });
          break;
        case 'BUG_FIX':
          questionData.bugs?.forEach((bug: any) => {
            if (bug.hint) hints.push(`第 ${bug.line} 行: ${bug.hint}`);
          });
          break;
      }
    }

    res.json({ hints });
  } catch (error) {
    next(error);
  }
});

export { router as questionsRouter };
