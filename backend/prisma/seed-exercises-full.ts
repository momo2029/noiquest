// 完整的1000道练习题数据
// 10个单元 × 10门课程 × 10道题 = 1000道题

import { Difficulty, QuestionType } from '@prisma/client';

export const exercises: any[] = [
  // ==================== 单元1: C++ 启航 (100题) ====================
  // 课程1: 认识C++
  {
    id: 'ex-01-01-01', title: 'C++的诞生', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 1, starterCode: '',
    questionData: {
      question: 'C++语言是由谁在哪个公司开发的？',
      options: [
        { id: 'A', text: 'Bjarne Stroustrup 在贝尔实验室', correct: true },
        { id: 'B', text: 'Dennis Ritchie 在微软', correct: false },
        { id: 'C', text: 'James Gosling 在Sun公司', correct: false },
        { id: 'D', text: 'Guido van Rossum 在谷歌', correct: false }
      ],
      explanation: 'C++由Bjarne Stroustrup于1979年在贝尔实验室开发'
    }
  },
  {
    id: 'ex-01-01-02', title: 'C++的特点', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 2, starterCode: '',
    questionData: {
      question: '以下哪个不是C++的特点？',
      options: [
        { id: 'A', text: '面向对象', correct: false },
        { id: 'B', text: '运行效率高', correct: false },
        { id: 'C', text: '自动内存管理', correct: true },
        { id: 'D', text: '支持泛型编程', correct: false }
      ],
      explanation: 'C++需要手动管理内存，不像Java有自动垃圾回收'
    }
  },
  {
    id: 'ex-01-01-03', title: 'C++文件扩展名', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 3, starterCode: '',
    questionData: {
      question: 'C++源代码文件通常使用什么扩展名？',
      options: [
        { id: 'A', text: '.cpp', correct: true },
        { id: 'B', text: '.java', correct: false },
        { id: 'C', text: '.py', correct: false },
        { id: 'D', text: '.js', correct: false }
      ],
      explanation: 'C++源文件通常使用.cpp扩展名，也可以用.cc或.cxx'
    }
  },
  {
    id: 'ex-01-01-04', title: 'C与C++关系', type: 'MATCHING' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 4, starterCode: '',
    questionData: {
      left: [
        { id: 'L1', text: 'C语言' },
        { id: 'L2', text: 'C++' },
        { id: 'L3', text: 'Java' },
        { id: 'L4', text: 'Python' }
      ],
      right: [
        { id: 'R1', text: '面向过程' },
        { id: 'R2', text: '面向对象+面向过程' },
        { id: 'R3', text: '纯面向对象' },
        { id: 'R4', text: '解释型语言' }
      ],
      pairs: [['L1', 'R1'], ['L2', 'R2'], ['L3', 'R3'], ['L4', 'R4']]
    }
  },
  {
    id: 'ex-01-01-05', title: 'NOI竞赛语言', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 5, starterCode: '',
    questionData: {
      question: 'NOI（全国青少年信息学奥林匹克竞赛）主要使用什么编程语言？',
      options: [
        { id: 'A', text: 'C/C++', correct: true },
        { id: 'B', text: 'Python', correct: false },
        { id: 'C', text: 'Java', correct: false },
        { id: 'D', text: 'JavaScript', correct: false }
      ],
      explanation: 'NOI竞赛主要使用C/C++语言，因为其运行效率高'
    }
  },
  {
    id: 'ex-01-01-06', title: '编译器选择', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 6, starterCode: '',
    questionData: {
      question: '以下哪个是常用的C++编译器？',
      options: [
        { id: 'A', text: 'g++', correct: true },
        { id: 'B', text: 'javac', correct: false },
        { id: 'C', text: 'python', correct: false },
        { id: 'D', text: 'node', correct: false }
      ],
      explanation: 'g++是GNU C++编译器，是最常用的C++编译器之一'
    }
  },
  {
    id: 'ex-01-01-07', title: '编程环境', type: 'MATCHING' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 7, starterCode: '',
    questionData: {
      left: [
        { id: 'L1', text: 'Dev-C++' },
        { id: 'L2', text: 'Visual Studio' },
        { id: 'L3', text: 'Code::Blocks' }
      ],
      right: [
        { id: 'R1', text: '轻量级，适合初学者' },
        { id: 'R2', text: '功能强大，微软出品' },
        { id: 'R3', text: '开源跨平台IDE' }
      ],
      pairs: [['L1', 'R1'], ['L2', 'R2'], ['L3', 'R3']]
    }
  },
  {
    id: 'ex-01-01-08', title: '程序执行过程', type: 'CODE_ORDER' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 8, starterCode: '',
    questionData: {
      description: '将C++程序从编写到运行的步骤排序',
      lines: [
        { id: '1', code: '编写源代码(.cpp文件)', order: 1 },
        { id: '2', code: '预处理(处理#include等)', order: 2 },
        { id: '3', code: '编译(生成目标文件)', order: 3 },
        { id: '4', code: '链接(生成可执行文件)', order: 4 },
        { id: '5', code: '运行程序', order: 5 }
      ]
    }
  },
  {
    id: 'ex-01-01-09', title: 'C++版本', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 9, starterCode: '',
    questionData: {
      question: 'NOI竞赛通常使用哪个C++标准？',
      options: [
        { id: 'A', text: 'C++14', correct: true },
        { id: 'B', text: 'C++98', correct: false },
        { id: 'C', text: 'C++20', correct: false },
        { id: 'D', text: 'C++23', correct: false }
      ],
      explanation: 'NOI竞赛通常使用C++14标准，部分比赛已支持C++17'
    }
  },
  {
    id: 'ex-01-01-10', title: '学习建议', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 10, starterCode: '',
    questionData: {
      question: '学习C++编程最重要的是什么？',
      options: [
        { id: 'A', text: '多写代码多练习', correct: true },
        { id: 'B', text: '只看书不动手', correct: false },
        { id: 'C', text: '背诵所有语法', correct: false },
        { id: 'D', text: '只做简单题目', correct: false }
      ],
      explanation: '编程是一门实践性很强的技能，需要多写代码多练习'
    }
  },

  // 课程2: 第一个程序
  {
    id: 'ex-01-02-01', title: 'Hello World', type: 'CODING' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 1,
    description: '编写你的第一个C++程序，在屏幕上输出 Hello, World!',
    starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在这里编写代码\n\n    return 0;\n}`,
    hint: '使用 cout << 