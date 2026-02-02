import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app.js';
import { createTestUser, prisma } from '../helpers/db.js';
import { generateTestToken } from '../helpers/auth.js';
import type { User, Exercise } from '@prisma/client';

const app = createTestApp();

describe('Questions API - 学生做题测试', () => {
  let testUser: User;
  let authToken: string;
  let exercises: {
    fillBlank: Exercise;
    codeOrder: Exercise;
    multipleChoice: Exercise;
    matching: Exercise;
    bugFix: Exercise;
    coding: Exercise;
  };

  beforeAll(async () => {
    // 创建测试用户
    testUser = await createTestUser({
      username: `question_test_${Date.now()}`,
      email: `question_test_${Date.now()}@test.com`,
    });
    authToken = generateTestToken(testUser.id, 'STUDENT', testUser.username);

    // 创建各种类型的测试题目
    const timestamp = Date.now();

    // 1. 填空题
    exercises = {} as typeof exercises;
    exercises.fillBlank = await prisma.exercise.create({
      data: {
        title: `测试填空题_${timestamp}`,
        description: '填写正确的代码',
        difficulty: 'EASY',
        category: '测试',
        type: 'FILL_BLANK',
        starterCode: '',
        xp: 10,
        questionData: {
          code: 'int x = ___BLANK_0___;\ncout << x ___BLANK_1___ 5;',
          blanks: [
            { id: '0', answer: '10', hint: '整数值', alternatives: ['10'] },
            { id: '1', answer: '+', hint: '运算符', alternatives: ['+'] },
          ],
        },
      },
    });

    // 2. 代码排序题
    exercises.codeOrder = await prisma.exercise.create({
      data: {
        title: `测试排序题_${timestamp}`,
        description: '将代码按正确顺序排列',
        difficulty: 'EASY',
        category: '测试',
        type: 'CODE_ORDER',
        starterCode: '',
        xp: 10,
        questionData: {
          description: '排列代码实现输出 1-5',
          lines: [
            { id: '0', code: 'for (int i = 1; i <= 5; i++) {', order: 1 },
            { id: '1', code: '    cout << i << endl;', order: 2 },
            { id: '2', code: '}', order: 3 },
          ],
        },
      },
    });

    // 3. 选择题
    exercises.multipleChoice = await prisma.exercise.create({
      data: {
        title: `测试选择题_${timestamp}`,
        description: '选择正确答案',
        difficulty: 'EASY',
        category: '测试',
        type: 'MULTIPLE_CHOICE',
        starterCode: '',
        xp: 10,
        questionData: {
          question: 'int x = 5; cout << x++;  输出什么？',
          options: [
            { id: 'A', text: '5', correct: true },
            { id: 'B', text: '6', correct: false },
            { id: 'C', text: '4', correct: false },
            { id: 'D', text: '编译错误', correct: false },
          ],
          explanation: '后置递增 x++ 先返回当前值 5，然后 x 变成 6',
        },
      },
    });

    // 4. 配对题
    exercises.matching = await prisma.exercise.create({
      data: {
        title: `测试配对题_${timestamp}`,
        description: '将左右两边正确配对',
        difficulty: 'EASY',
        category: '测试',
        type: 'MATCHING',
        starterCode: '',
        xp: 10,
        questionData: {
          left: [
            { id: 'L1', text: '声明变量' },
            { id: 'L2', text: '输出' },
            { id: 'L3', text: '输入' },
          ],
          right: [
            { id: 'R1', text: 'int x = 10;' },
            { id: 'R2', text: 'cout << x;' },
            { id: 'R3', text: 'cin >> x;' },
          ],
          pairs: [
            ['L1', 'R1'],
            ['L2', 'R2'],
            ['L3', 'R3'],
          ],
        },
      },
    });

    // 5. 改错题
    exercises.bugFix = await prisma.exercise.create({
      data: {
        title: `测试改错题_${timestamp}`,
        description: '修复代码中的错误',
        difficulty: 'EASY',
        category: '测试',
        type: 'BUG_FIX',
        starterCode: '',
        xp: 10,
        questionData: {
          buggyCode: 'int sum = 0\nfor (i = 0; i < 5; i++)\n    sum += i;',
          bugs: [
            { line: 1, fix: 'int sum = 0;', hint: '缺少分号' },
            { line: 2, fix: 'for (int i = 0; i < 5; i++) {', hint: '缺少类型声明和大括号' },
          ],
          correctCode: 'int sum = 0;\nfor (int i = 0; i < 5; i++) {\n    sum += i;\n}',
        },
      },
    });

    // 6. 编程题（无测试用例，仅检查结构）
    exercises.coding = await prisma.exercise.create({
      data: {
        title: `测试编程题_${timestamp}`,
        description: '编写一个输出 Hello World 的程序',
        difficulty: 'EASY',
        category: '测试',
        type: 'CODING',
        starterCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // 你的代码\n    return 0;\n}',
        xp: 10,
        questionData: {},
      },
    });
  });

  afterAll(async () => {
    // 清理测试数据
    const exerciseIds = Object.values(exercises).map((e) => e.id);

    // 删除相关进度记录
    await prisma.exerciseProgress.deleteMany({
      where: { exerciseId: { in: exerciseIds } },
    });

    // 删除错题记录
    await prisma.mistakeRecord.deleteMany({
      where: { exerciseId: { in: exerciseIds } },
    });

    // 删除每日XP记录
    await prisma.dailyXpRecord.deleteMany({
      where: { userId: testUser.id },
    });

    // 删除测试题目
    await prisma.exercise.deleteMany({
      where: { id: { in: exerciseIds } },
    });

    // 删除测试用户
    await prisma.user.delete({
      where: { id: testUser.id },
    });
  });

  beforeEach(async () => {
    // 每个测试前清理进度和错题记录
    const exerciseIds = Object.values(exercises).map((e) => e.id);
    await prisma.exerciseProgress.deleteMany({
      where: { userId: testUser.id, exerciseId: { in: exerciseIds } },
    });
    await prisma.mistakeRecord.deleteMany({
      where: { userId: testUser.id, exerciseId: { in: exerciseIds } },
    });
  });

  describe('GET /api/questions/:exerciseId - 获取题目', () => {
    it('应返回填空题详情', async () => {
      const response = await request(app)
        .get(`/api/questions/${exercises.fillBlank.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', exercises.fillBlank.id);
      expect(response.body).toHaveProperty('type', 'FILL_BLANK');
      expect(response.body).toHaveProperty('questionData');
      expect(response.body.questionData).toHaveProperty('blanks');
    });

    it('题目不存在时应返回 404', async () => {
      const response = await request(app)
        .get('/api/questions/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', '题目不存在');
    });

    it('未认证时应返回 401', async () => {
      await request(app)
        .get(`/api/questions/${exercises.fillBlank.id}`)
        .expect(401);
    });
  });

  describe('POST /api/questions/:exerciseId/answer - 填空题', () => {
    it('答案正确时应返回 correct=true', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.fillBlank.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: { '0': '10', '1': '+' },
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', true);
      expect(response.body).toHaveProperty('feedback');
      expect(response.body).toHaveProperty('xpEarned', 10);
    });

    it('答案错误时应返回 correct=false 并记录错题', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.fillBlank.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: { '0': '5', '1': '-' },
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', false);
      expect(response.body).toHaveProperty('correctAnswer');
      expect(response.body.xpEarned).toBe(0);

      // 验证错题记录
      const mistake = await prisma.mistakeRecord.findUnique({
        where: {
          userId_exerciseId: {
            userId: testUser.id,
            exerciseId: exercises.fillBlank.id,
          },
        },
      });
      expect(mistake).not.toBeNull();
      expect(mistake?.status).toBe('UNREVIEWED');
    });

    it('部分正确时应返回 correct=false', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.fillBlank.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: { '0': '10', '1': '-' },
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', false);
    });
  });

  describe('POST /api/questions/:exerciseId/answer - 代码排序题', () => {
    it('顺序正确时应返回 correct=true', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.codeOrder.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: ['0', '1', '2'],
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', true);
      expect(response.body).toHaveProperty('xpEarned', 10);
    });

    it('顺序错误时应返回 correct=false', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.codeOrder.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: ['2', '1', '0'],
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', false);
      expect(response.body).toHaveProperty('correctAnswer');
    });
  });

  describe('POST /api/questions/:exerciseId/answer - 选择题', () => {
    it('选择正确答案时应返回 correct=true', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.multipleChoice.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: 'A',
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', true);
      expect(response.body).toHaveProperty('xpEarned', 10);
    });

    it('选择错误答案时应返回 correct=false 和解释', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.multipleChoice.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: 'B',
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', false);
      expect(response.body.feedback).toContain('后置递增');
    });
  });

  describe('POST /api/questions/:exerciseId/answer - 配对题', () => {
    it('配对全部正确时应返回 correct=true', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.matching.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: [
            ['L1', 'R1'],
            ['L2', 'R2'],
            ['L3', 'R3'],
          ],
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', true);
      expect(response.body).toHaveProperty('xpEarned', 10);
    });

    it('配对部分错误时应返回 correct=false', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.matching.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: [
            ['L1', 'R2'],
            ['L2', 'R1'],
            ['L3', 'R3'],
          ],
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', false);
    });

    it('配对数量不足时应返回 correct=false', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.matching.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: [['L1', 'R1']],
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', false);
    });
  });

  describe('POST /api/questions/:exerciseId/answer - 改错题', () => {
    it('修复全部正确时应返回 correct=true', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.bugFix.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: {
            1: 'int sum = 0;',
            2: 'for (int i = 0; i < 5; i++) {',
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', true);
      expect(response.body).toHaveProperty('xpEarned', 10);
    });

    it('修复部分正确时应返回 correct=false', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.bugFix.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: {
            1: 'int sum = 0;',
            2: 'for (i = 0; i < 5; i++)',
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', false);
      expect(response.body).toHaveProperty('correctAnswer');
    });
  });

  describe('POST /api/questions/:exerciseId/answer - 编程题', () => {
    it('提交有效代码时应返回 correct=true', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.coding.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}',
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', true);
      expect(response.body).toHaveProperty('xpEarned', 10);
    });

    it('提交空代码时应返回 correct=false', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.coding.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: '',
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', false);
      expect(response.body.feedback).toContain('请编写代码');
    });

    it('提交未修改的初始代码时应返回 correct=false', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.coding.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: exercises.coding.starterCode,
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', false);
      expect(response.body.feedback).toContain('请修改初始代码');
    });

    it('提交缺少 main 函数的代码时应返回 correct=false', async () => {
      const response = await request(app)
        .post(`/api/questions/${exercises.coding.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: '#include <iostream>\nusing namespace std;\n\nvoid hello() {\n    cout << "Hello";\n}',
        })
        .expect(200);

      expect(response.body).toHaveProperty('correct', false);
      expect(response.body.feedback).toContain('main');
    });
  });

  describe('XP 奖励机制', () => {
    it('首次答对应获得完整 XP', async () => {
      const userBefore = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      await request(app)
        .post(`/api/questions/${exercises.fillBlank.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: { '0': '10', '1': '+' },
        })
        .expect(200);

      const userAfter = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(userAfter!.xp).toBe(userBefore!.xp + 10);
      expect(userAfter!.totalXp).toBe(userBefore!.totalXp + 10);
    });

    it('重复答对不应重复获得 XP', async () => {
      // 第一次答对
      await request(app)
        .post(`/api/questions/${exercises.fillBlank.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: { '0': '10', '1': '+' },
        })
        .expect(200);

      const userAfterFirst = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      // 第二次答对
      const response = await request(app)
        .post(`/api/questions/${exercises.fillBlank.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: { '0': '10', '1': '+' },
        })
        .expect(200);

      const userAfterSecond = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      // XP 不应增加
      expect(userAfterSecond!.xp).toBe(userAfterFirst!.xp);
      expect(response.body.xpEarned).toBe(10); // API 仍返回题目 XP 值
    });
  });

  describe('进度记录', () => {
    it('答对后应创建进度记录', async () => {
      await request(app)
        .post(`/api/questions/${exercises.multipleChoice.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: 'A',
        })
        .expect(200);

      const progress = await prisma.exerciseProgress.findUnique({
        where: {
          userId_exerciseId: {
            userId: testUser.id,
            exerciseId: exercises.multipleChoice.id,
          },
        },
      });

      expect(progress).not.toBeNull();
      expect(progress?.completed).toBe(true);
      expect(progress?.completedAt).not.toBeNull();
    });

    it('获取题目时应包含用户进度', async () => {
      // 先完成题目
      await request(app)
        .post(`/api/questions/${exercises.multipleChoice.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: 'A',
        })
        .expect(200);

      // 再获取题目
      const response = await request(app)
        .get(`/api/questions/${exercises.multipleChoice.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userProgress');
      expect(response.body.userProgress).toHaveProperty('completed', true);
    });
  });

  describe('GET /api/questions/:exerciseId/hint - 获取提示', () => {
    it('应返回填空题的提示', async () => {
      const response = await request(app)
        .get(`/api/questions/${exercises.fillBlank.id}/hint`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('hints');
      expect(Array.isArray(response.body.hints)).toBe(true);
    });

    it('应返回改错题的提示', async () => {
      const response = await request(app)
        .get(`/api/questions/${exercises.bugFix.id}/hint`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('hints');
      expect(response.body.hints.length).toBeGreaterThan(0);
    });
  });
});
