// 生成练习题脚本 - 用于生成完整的1000道题
// 运行方式: npx tsx prisma/generate-exercises.ts > prisma/seed-exercises-full.ts

import { Difficulty, QuestionType } from '@prisma/client';

// 题目类型定义
interface Exercise {
  id: string;
  title: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  xp: number;
  unitId: string;
  lessonId: string;
  orderIndex: number;
  description?: string;
  starterCode?: string;
  hint?: string;
  solution?: string;
  questionData?: any;
}

// 生成单选题
function generateMultipleChoice(
  id: string,
  title: string,
  question: string,
  options: { id: string; text: string; correct: boolean }[],
  explanation: string,
  difficulty: Difficulty = 'EASY',
  xp: number = 10
): Partial<Exercise> {
  return {
    id,
    title,
    type: 'MULTIPLE_CHOICE',
    difficulty,
    xp,
    questionData: { question, options, explanation }
  };
}

// 生成填空题
function generateFillBlank(
  id: string,
  title: string,
  code: string,
  blanks: { id: string; answer: string; hint: string; alternatives: string[] }[],
  difficulty: Difficulty = 'EASY',
  xp: number = 10
): Partial<Exercise> {
  return {
    id,
    title,
    type: 'FILL_BLANK',
    difficulty,
    xp,
    questionData: { code, blanks }
  };
}

// 生成编程题
function generateCoding(
  id: string,
  title: string,
  description: string,
  starterCode: string,
  hint: string,
  solution: string,
  difficulty: Difficulty = 'MEDIUM',
  xp: number = 20
): Partial<Exercise> {
  return {
    id,
    title,
    type: 'CODING',
    difficulty,
    xp,
    description,
    starterCode,
    hint,
    solution
  };
}

// 生成匹配题
function generateMatching(
  id: string,
  title: string,
  left: { id: string; text: string }[],
  right: { id: string; text: string }[],
  pairs: [string, string][],
  difficulty: Difficulty = 'EASY',
  xp: number = 15
): Partial<Exercise> {
  return {
    id,
    title,
    type: 'MATCHING',
    difficulty,
    xp,
    questionData: { left, right, pairs }
  };
}

// 生成代码排序题
function generateCodeOrder(
  id: string,
  title: string,
  description: string,
  lines: { id: string; code: string; order: number }[],
  difficulty: Difficulty = 'EASY',
  xp: number = 15
): Partial<Exercise> {
  return {
    id,
    title,
    type: 'CODE_ORDER',
    difficulty,
    xp,
    questionData: { description, lines }
  };
}

// 单元1: C++启航 (100题)
const unit1Exercises: Partial<Exercise>[] = [
  // 课程1: 认识C++
  generateMultipleChoice('ex-01-01-01', 'C++的诞生', 'C++语言是由谁开发的?', [
    { id: 'A', text: 'Bjarne Stroustrup 在贝尔实验室', correct: true },
    { id: 'B', text: 'Dennis Ritchie 在微软', correct: false },
    { id: 'C', text: 'James Gosling 在Sun公司', correct: false },
    { id: 'D', text: 'Guido van Rossum 在谷歌', correct: false }
  ], 'C++由Bjarne Stroustrup于1979年在贝尔实验室开发'),
  generateMultipleChoice('ex-01-01-02', 'C++的特点', '以下哪个不是C++的特点?', [
    { id: 'A', text: '面向对象', correct: false },
    { id: 'B', text: '运行效率高', correct: false },
    { id: 'C', text: '自动内存管理', correct: true },
    { id: 'D', text: '支持泛型编程', correct: false }
  ], 'C++需要手动管理内存'),
  generateMultipleChoice('ex-01-01-03', '文件扩展名', 'C++源文件通常使用什么扩展名?', [
    { id: 'A', text: '.cpp', correct: true },
    { id: 'B', text: '.java', correct: false },
    { id: 'C', text: '.py', correct: false },
    { id: 'D', text: '.js', correct: false }
  ], 'C++源文件通常使用.cpp扩展名'),
  generateMatching('ex-01-01-04', '语言对比', [
    { id: 'L1', text: 'C语言' },
    { id: 'L2', text: 'C++' },
    { id: 'L3', text: 'Java' },
    { id: 'L4', text: 'Python' }
  ], [
    { id: 'R1', text: '面向过程' },
    { id: 'R2', text: '面向对象+面向过程' },
    { id: 'R3', text: '纯面向对象' },
    { id: 'R4', text: '解释型语言' }
  ], [['L1', 'R1'], ['L2', 'R2'], ['L3', 'R3'], ['L4', 'R4']]),
  generateMultipleChoice('ex-01-01-05', 'NOI竞赛语言', 'NOI竞赛主要使用什么编程语言?', [
    { id: 'A', text: 'C/C++', correct: true },
    { id: 'B', text: 'Python', correct: false },
    { id: 'C', text: 'Java', correct: false },
    { id: 'D', text: 'JavaScript', correct: false }
  ], 'NOI竞赛主要使用C/C++语言'),
  generateMultipleChoice('ex-01-01-06', '编译器选择', '以下哪个是常用的C++编译器?', [
    { id: 'A', text: 'g++', correct: true },
    { id: 'B', text: 'javac', correct: false },
    { id: 'C', text: 'python', correct: false },
    { id: 'D', text: 'node', correct: false }
  ], 'g++是GNU C++编译器'),
  generateMatching('ex-01-01-07', '编程环境', [
    { id: 'L1', text: 'Dev-C++' },
    { id: 'L2', text: 'Visual Studio' },
    { id: 'L3', text: 'Code::Blocks' }
  ], [
    { id: 'R1', text: '轻量级，适合初学者' },
    { id: 'R2', text: '功能强大，微软出品' },
    { id: 'R3', text: '开源跨平台IDE' }
  ], [['L1', 'R1'], ['L2', 'R2'], ['L3', 'R3']]),
  generateCodeOrder('ex-01-01-08', '程序执行过程', '将C++程序从编写到运行的步骤排序', [
    { id: '1', code: '编写源代码(.cpp文件)', order: 1 },
    { id: '2', code: '预处理(处理#include等)', order: 2 },
    { id: '3', code: '编译(生成目标文件)', order: 3 },
    { id: '4', code: '链接(生成可执行文件)', order: 4 },
    { id: '5', code: '运行程序', order: 5 }
  ]),
  generateMultipleChoice('ex-01-01-09', 'C++版本', 'NOI竞赛通常使用哪个C++标准?', [
    { id: 'A', text: 'C++14', correct: true },
    { id: 'B', text: 'C++98', correct: false },
    { id: 'C', text: 'C++20', correct: false },
    { id: 'D', text: 'C++23', correct: false }
  ], 'NOI竞赛通常使用C++14标准'),
  generateMultipleChoice('ex-01-01-10', '学习建议', '学习C++编程最重要的是什么?', [
    { id: 'A', text: '多写代码多练习', correct: true },
    { id: 'B', text: '只看书不动手', correct: false },
    { id: 'C', text: '背诵所有语法', correct: false },
    { id: 'D', text: '只做简单题目', correct: false }
  ], '编程是实践性很强的技能'),

  // 课程2: 第一个程序
  generateCoding('ex-01-02-01', 'Hello World', '输出 Hello, World!',
    `#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在这里编写代码\n\n    return 0;\n}`,
    '使用 cout << 