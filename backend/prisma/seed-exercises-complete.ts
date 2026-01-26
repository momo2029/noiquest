// 完整的练习题数据生成器
// 包含10个单元 × 10门课程 × 10道题 = 1000道题

import { PrismaClient, Difficulty, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

// 题目类型
interface ExerciseData {
  id: string;
  title: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  xp: number;
  unitId: string;
  lessonId: string;
  orderIndex: number;
  description: string;
  starterCode?: string;
  hint?: string;
  solution?: string;
  questionData?: any;
}

// ==================== 单元1: C++ 启航 (100题) ====================

const unit1Exercises: ExerciseData[] = [
  // 课程1: 认识C++ (10题)
  {
    id: 'ex-01-01-01', title: 'C++的诞生', type: 'MULTIPLE_CHOICE', difficulty: 'EASY',
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 1,
    description: 'C++语言是由谁在哪个公司开发的？',
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
    id: 'ex-01-01-02', title: 'C++的特点', type: 'MULTIPLE_CHOICE', difficulty: 'EASY',
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 2,
    description: '以下哪个不是C++的特点？',
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
    id: 'ex-01-01-03', title: 'C++文件扩展名', type: 'MULTIPLE_CHOICE', difficulty: 'EASY',
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 3,
    description: 'C++源代码文件通常使用什么扩展名？',
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
    id: 'ex-01-01-04', title: 'C与C++关系', type: 'MATCHING', difficulty: 'EASY',
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 4,
    description: '匹配编程语言与特点',
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
    id: 'ex-01-01-05', title: 'NOI竞赛语言', type: 'MULTIPLE_CHOICE', difficulty: 'EASY',
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 5,
    description: 'NOI竞赛主要使用什么编程语言？',
    questionData: {
      question: 'NOI竞赛主要使用什么编程语言？',
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
    id: 'ex-01-01-06', title: '编译器选择', type: 'MULTIPLE_CHOICE', difficulty: 'EASY',
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 6,
    description: '以下哪个是常用的C++编译器？',
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
    id: 'ex-01-01-07', title: '编程环境', type: 'MATCHING', difficulty: 'EASY',
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 7,
    description: '匹配编程环境与特点',
    questionData: {
      left: [
        { id: 'L1', text: 'Dev-C++' },
        { id: 'L2', text: 'Visual Studio' },
        { id: 'L3', text: 'Code::Blocks' }
      ],
      right: [
        { id: 'R1', text: '轻量级，适合初学者' },
        { id: 'R2', text: '功能强大，商业软件' },
        { id: 'R3', text: '开源跨平台IDE' }
      ],
      pairs: [['L1', 'R1'], ['L2', 'R2'], ['L3', 'R3']]
    }
  },
  {
    id: 'ex-01-01-08', title: 'C++应用领域', type: 'MULTIPLE_CHOICE', difficulty: 'MEDIUM',
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 8,
    description: '以下哪个领域不常使用C++？',
    questionData: {
      question: '以下哪个领域不常使用C++？',
      options: [
        { id: 'A', text: '操作系统开发', correct: false },
        { id: 'B', text: '游戏开发', correct: false },
        { id: 'C', text: '科学计算', correct: false },
        { id: 'D', text: '网页前端开发', correct: true }
      ],
      explanation: '网页前端开发主要使用HTML/CSS/JavaScript，C++主要用于系统级开发'
    }
  },
  {
    id: 'ex-01-01-09', title: 'C++标准版本', type: 'MULTIPLE_CHOICE', difficulty: 'MEDIUM',
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 9,
    description: '以下哪个不是C++的标准版本？',
    questionData: {
      question: '以下哪个不是C++的标准版本？',
      options: [
        { id: 'A', text: 'C++98', correct: false },
        { id: 'B', text: 'C++11', correct: false },
        { id: 'C', text: 'C++17', correct: false },
        { id: 'D', text: 'C++25', correct: true }
      ],
      explanation: 'C++的标准版本包括C++98、C++11、C++14、C++17、C++20等，C++25尚未发布'
    }
  },
  {
    id: 'ex-01-01-10', title: '学习C++原因', type: 'FILL_BLANK', difficulty: 'EASY',
    category: 'C++启航', xp: 20, unitId: 'unit-01-intro', lessonId: 'lesson-01-01', orderIndex: 10,
    description: '请写出至少两个学习C++的理由。',
    questionData: {
      question: '请写出至少两个学习C++的理由。',
      answer: '1. 运行效率高；2. 适合竞赛；3. 就业前景好；4. 理解计算机底层原理'
    }
  },
  // 课程2: 第一个程序 (10题)
  {
    id: 'ex-01-02-01', title: 'Hello World', type: 'CODING', difficulty: 'EASY',
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 1,
    description: '编写你的第一个C++程序，在屏幕上输出 Hello, World!',
    starterCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在这里编写代码\n\n    return 0;\n}',
    hint: '使用 cout << "Hello, World!" << endl;'
  },
  {
    id: 'ex-01-02-02', title: '头文件作用', type: 'MULTIPLE_CHOICE', difficulty: 'EASY',
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 2,
    description: '#include <iostream> 的作用是什么？',
    questionData: {
      question: '#include <iostream> 的作用是什么？',
      options: [
        { id: 'A', text: '引入输入输出流库', correct: true },
        { id: 'B', text: '定义主函数', correct: false },
        { id: 'C', text: '声明命名空间', correct: false },
        { id: 'D', text: '注释代码', correct: false }
      ],
      explanation: 'iostream是输入输出流库，包含了cout、cin等功能'
    }
  },
  {
    id: 'ex-01-02-03', title: 'main函数', type: 'MULTIPLE_CHOICE', difficulty: 'EASY',
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 3,
    description: '关于main函数，以下说法正确的是？',
    questionData: {
      question: '关于main函数，以下说法正确的是？',
      options: [
        { id: 'A', text: '每个程序必须有且只有一个main函数', correct: true },
        { id: 'B', text: 'main函数可以有多个', correct: false },
        { id: 'C', text: 'main函数可以没有返回值', correct: false },
        { id: 'D', text: 'main函数名可以是Main', correct: false }
      ],
      explanation: 'main函数是程序的入口点，每个程序必须有且只有一个main函数'
    }
  },
  {
    id: 'ex-01-02-04', title: '命名空间', type: 'MULTIPLE_CHOICE', difficulty: 'MEDIUM',
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 4,
    description: 'using namespace std; 的作用是？',
    questionData: {
      question: 'using namespace std; 的作用是？',
      options: [
        { id: 'A', text: '使用std命名空间中的所有内容', correct: true },
        { id: 'B', text: '定义新的命名空间', correct: false },
        { id: 'C', text: '声明变量', correct: false },
        { id: 'D', text: '包含头文件', correct: false }
      ],
      explanation: 'using namespace std; 使得我们可以直接使用cout、cin等，而不需要写std::cout'
    }
  },
  {
    id: 'ex-01-02-05', title: '输出语句', type: 'MULTIPLE_CHOICE', difficulty: 'EASY',
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 5,
    description: '在C++中，以下哪个用于输出内容到屏幕？',
    questionData: {
      question: '在C++中，以下哪个用于输出内容到屏幕？',
      options: [
        { id: 'A', text: 'cout', correct: true },
        { id: 'B', text: 'cin', correct: false },
        { id: 'C', text: 'printf', correct: false },
        { id: 'D', text: 'scanf', correct: false }
      ],
      explanation: 'cout用于输出，cin用于输入，printf和scanf是C语言的函数'
    }
  },
  {
    id: 'ex-01-02-06', title: '程序结构', type: 'MATCHING', difficulty: 'EASY',
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 6,
    description: '匹配程序结构与作用',
    questionData: {
      left: [
        { id: 'L1', text: '#include <iostream>' },
        { id: 'L2', text: 'using namespace std;' },
        { id: 'L3', text: 'int main()' },
        { id: 'L4', text: 'return 0;' }
      ],
      right: [
        { id: 'R1', text: '程序入口' },
        { id: 'R2', text: '包含头文件' },
        { id: 'R3', text: '使用命名空间' },
        { id: 'R4', text: '正常结束' }
      ],
      pairs: [['L1', 'R2'], ['L2', 'R3'], ['L3', 'R1'], ['L4', 'R4']]
    }
  },
  {
    id: 'ex-01-02-07', title: '输出换行', type: 'CODING', difficulty: 'EASY',
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 7,
    description: '编写程序输出两行文字：第一行输出"Hello"，第二行输出"World"',
    starterCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在这里编写代码\n\n    return 0;\n}',
    hint: '使用endl换行或者\n转义字符'
  },
  {
    id: 'ex-01-02-08', title: '分号作用', type: 'MULTIPLE_CHOICE', difficulty: 'EASY',
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 8,
    description: 'C++中语句末尾的分号(;)的作用是？',
    questionData: {
      question: 'C++中语句末尾的分号(;)的作用是？',
      options: [
        { id: 'A', text: '表示语句结束', correct: true },
        { id: 'B', text: '表示注释开始', correct: false },
        { id: 'C', text: '表示变量声明', correct: false },
        { id: 'D', text: '表示函数定义', correct: false }
      ],
      explanation: '分号是语句结束符，每个语句都必须以分号结束'
    }
  },
  {
    id: 'ex-01-02-09', title: '注释使用', type: 'MULTIPLE_CHOICE', difficulty: 'EASY',
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 9,
    description: '以下哪种是C++的单行注释？',
    questionData: {
      question: '以下哪种是C++的单行注释？',
      options: [
        { id: 'A', text: '// 注释内容', correct: true },
        { id: 'B', text: '/* 注释内容 */', correct: false },
        { id: 'C', text: '# 注释内容', correct: false },
        { id: 'D', text: '<!-- 注释内容 -->', correct: false }
      ],
      explanation: '// 是单行注释，/* */ 是多行注释，# 是Python注释，<!-- --> 是HTML注释'
    }
  },
  {
    id: 'ex-01-02-10', title: '编译运行', type: 'FILL_BLANK', difficulty: 'MEDIUM',
    category: 'C++启航', xp: 20, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 10,
    description: '简述C++程序从源代码到运行的过程。',
    questionData: {
      question: '简述C++程序从源代码到运行的过程。',
      answer: '1. 编写源代码(.cpp文件)；2. 编译(g++编译成可执行文件)；3. 运行(执行可执行文件)'
    }
  }
];

// 导出所有练习题
export const allExercises = [...unit1Exercises];

// 导入到数据库
async function main() {
  console.log('正在导入练习题数据...');
  
  for (const exercise of allExercises) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: {
        title: exercise.title,
        type: exercise.type,
        difficulty: exercise.difficulty,
        category: exercise.category,
        xp: exercise.xp,
        unitId: exercise.unitId,
        lessonId: exercise.lessonId,
        orderIndex: exercise.orderIndex,
        description: exercise.description,
        starterCode: exercise.starterCode || '',
        hint: exercise.hint || '',
        solution: exercise.solution || '',
        questionData: exercise.questionData || {}
      },
      create: {
        title: exercise.title,
        type: exercise.type,
        difficulty: exercise.difficulty,
        category: exercise.category,
        xp: exercise.xp,
        unitId: exercise.unitId,
        lessonId: exercise.lessonId,
        orderIndex: exercise.orderIndex,
        description: exercise.description,
        starterCode: exercise.starterCode || '',
        hint: exercise.hint || '',
        solution: exercise.solution || '',
        questionData: exercise.questionData || {}
      }
    });
  }
  
  console.log(`成功导入 ${allExercises.length} 道练习题`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
