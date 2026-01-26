// 单元1-3的题目数据（300道题）
import { Difficulty, QuestionType } from '@prisma/client';

export const exercises_unit1 = [
  // ===== 单元1 课程1: 认识C++ =====
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

  // ===== 单元1 课程2: 第一个程序 =====
  {
    id: 'ex-01-02-01', title: 'Hello World', type: 'CODING' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 1,
    description: '编写你的第一个C++程序，在屏幕上输出 Hello, World!',
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // 在这里编写代码

    return 0;
}`,
    hint: '使用 cout << "Hello, World!" << endl;',
    solution: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`
  },
  {
    id: 'ex-01-02-02', title: '头文件作用', type: 'FILL_BLANK' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 2, starterCode: '',
    questionData: {
      code: '#include <___BLANK_1___>\nusing namespace std;\n\nint main() {\n    cout << "Hello";\n    return 0;\n}',
      blanks: [
        { id: 'BLANK_1', answer: 'iostream', hint: '输入输出流头文件', alternatives: ['iostream'] }
      ]
    }
  },
  {
    id: 'ex-01-02-03', title: 'main函数', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 3, starterCode: '',
    questionData: {
      question: 'C++程序从哪个函数开始执行？',
      options: [
        { id: 'A', text: 'main函数', correct: true },
        { id: 'B', text: 'start函数', correct: false },
        { id: 'C', text: 'begin函数', correct: false },
        { id: 'D', text: '第一个函数', correct: false }
      ],
      explanation: 'C++程序总是从main函数开始执行'
    }
  },
  {
    id: 'ex-01-02-04', title: '程序结构排序', type: 'CODE_ORDER' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 4, starterCode: '',
    questionData: {
      description: '将代码行排列成正确的Hello World程序',
      lines: [
        { id: '1', code: '#include <iostream>', order: 1 },
        { id: '2', code: 'using namespace std;', order: 2 },
        { id: '3', code: 'int main() {', order: 3 },
        { id: '4', code: '    cout << "Hello, World!" << endl;', order: 4 },
        { id: '5', code: '    return 0;', order: 5 },
        { id: '6', code: '}', order: 6 }
      ]
    }
  },
  {
    id: 'ex-01-02-05', title: 'return语句', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 5, starterCode: '',
    questionData: {
      question: 'main函数中 return 0; 表示什么？',
      options: [
        { id: 'A', text: '程序正常结束', correct: true },
        { id: 'B', text: '程序出错', correct: false },
        { id: 'C', text: '返回到开头', correct: false },
        { id: 'D', text: '没有任何意义', correct: false }
      ],
      explanation: 'return 0表示程序正常结束，非0值通常表示出错'
    }
  },
  {
    id: 'ex-01-02-06', title: '输出你的名字', type: 'CODING' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 6,
    description: '编写程序输出 My name is NOI',
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // 输出 My name is NOI

    return 0;
}`,
    hint: '使用cout输出字符串',
    solution: `#include <iostream>
using namespace std;

int main() {
    cout << "My name is NOI" << endl;
    return 0;
}`
  },
  {
    id: 'ex-01-02-07', title: 'namespace作用', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 7, starterCode: '',
    questionData: {
      question: 'using namespace std; 的作用是什么？',
      options: [
        { id: 'A', text: '使用标准命名空间，可以直接用cout而不是std::cout', correct: true },
        { id: 'B', text: '定义一个新的命名空间', correct: false },
        { id: 'C', text: '导入所有头文件', correct: false },
        { id: 'D', text: '声明main函数', correct: false }
      ],
      explanation: '使用std命名空间后，可以直接使用cout、cin等，不需要加std::前缀'
    }
  },
  {
    id: 'ex-01-02-08', title: '大括号作用', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 8, starterCode: '',
    questionData: {
      question: 'main函数中的大括号{}的作用是什么？',
      options: [
        { id: 'A', text: '标记函数体的开始和结束', correct: true },
        { id: 'B', text: '装饰作用', correct: false },
        { id: 'C', text: '表示注释', correct: false },
        { id: 'D', text: '可以省略', correct: false }
      ],
      explanation: '大括号用于标记代码块的范围，函数体必须用大括号包围'
    }
  },
  {
    id: 'ex-01-02-09', title: '分号作用', type: 'BUG_FIX' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 9, starterCode: '',
    questionData: {
      buggyCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello"\n    return 0;\n}',
      bugs: [
        { line: 5, fix: '    cout << "Hello";', hint: '语句末尾缺少分号' }
      ],
      correctCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello";\n    return 0;\n}'
    }
  },
  {
    id: 'ex-01-02-10', title: '多行输出', type: 'CODING' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-02', orderIndex: 10,
    description: '编写程序，分两行输出：第一行输出 Hello，第二行输出 World',
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // 第一行输出 Hello
    // 第二行输出 World

    return 0;
}`,
    hint: '使用两个cout语句，或者使用endl换行',
    solution: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello" << endl;
    cout << "World" << endl;
    return 0;
}`
  },

  // ===== 单元1 课程3: 程序结构 =====
  {
    id: 'ex-01-03-01', title: '预处理指令', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-03', orderIndex: 1, starterCode: '',
    questionData: {
      question: '#include 是什么类型的指令？',
      options: [
        { id: 'A', text: '预处理指令', correct: true },
        { id: 'B', text: '函数调用', correct: false },
        { id: 'C', text: '变量声明', correct: false },
        { id: 'D', text: '注释', correct: false }
      ],
      explanation: '#开头的都是预处理指令，在编译前由预处理器处理'
    }
  },
  {
    id: 'ex-01-03-02', title: '头文件配对', type: 'MATCHING' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-03', orderIndex: 2, starterCode: '',
    questionData: {
      left: [
        { id: 'L1', text: '<iostream>' },
        { id: 'L2', text: '<cmath>' },
        { id: 'L3', text: '<string>' },
        { id: 'L4', text: '<cstdio>' }
      ],
      right: [
        { id: 'R1', text: '输入输出流' },
        { id: 'R2', text: '数学函数' },
        { id: 'R3', text: '字符串类' },
        { id: 'R4', text: 'C风格输入输出' }
      ],
      pairs: [['L1', 'R1'], ['L2', 'R2'], ['L3', 'R3'], ['L4', 'R4']]
    }
  },
  {
    id: 'ex-01-03-03', title: '程序组成', type: 'CODE_ORDER' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-03', orderIndex: 3, starterCode: '',
    questionData: {
      description: '按照C++程序的标准结构排序',
      lines: [
        { id: '1', code: '// 1. 预处理指令（头文件）', order: 1 },
        { id: '2', code: '// 2. 命名空间声明', order: 2 },
        { id: '3', code: '// 3. 全局变量/常量（如果有）', order: 3 },
        { id: '4', code: '// 4. 函数声明（如果有）', order: 4 },
        { id: '5', code: '// 5. main函数', order: 5 },
        { id: '6', code: '// 6. 其他函数定义（如果有）', order: 6 }
      ]
    }
  },
  {
    id: 'ex-01-03-04', title: '语句结束符', type: 'FILL_BLANK' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-03', orderIndex: 4, starterCode: '',
    questionData: {
      code: 'int a = 10___BLANK_1___\ncout << a___BLANK_2___',
      blanks: [
        { id: 'BLANK_1', answer: ';', hint: '语句结束符', alternatives: [';'] },
        { id: 'BLANK_2', answer: ';', hint: '语句结束符', alternatives: [';'] }
      ]
    }
  },
  {
    id: 'ex-01-03-05', title: '代码块', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-03', orderIndex: 5, starterCode: '',
    questionData: {
      question: '以下哪个符号用于标记代码块？',
      options: [
        { id: 'A', text: '{ }', correct: true },
        { id: 'B', text: '( )', correct: false },
        { id: 'C', text: '[ ]', correct: false },
        { id: 'D', text: '< >', correct: false }
      ],
      explanation: '大括号{}用于标记代码块，如函数体、循环体等'
    }
  },
  {
    id: 'ex-01-03-06', title: '缩进规范', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-03', orderIndex: 6, starterCode: '',
    questionData: {
      question: '代码缩进的主要作用是什么？',
      options: [
        { id: 'A', text: '提高代码可读性', correct: true },
        { id: 'B', text: '让程序运行更快', correct: false },
        { id: 'C', text: '减少编译错误', correct: false },
        { id: 'D', text: '节省内存', correct: false }
      ],
      explanation: '缩进不影响程序运行，但能让代码结构更清晰，便于阅读和维护'
    }
  },
  {
    id: 'ex-01-03-07', title: '完整程序', type: 'CODING' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-03', orderIndex: 7,
    description: '补全程序结构，使其能正确输出数字 2024',
    starterCode: `// 补全头文件

// 补全命名空间声明

int main() {
    cout << 2024 << endl;
    return 0;
}`,
    hint: '需要添加#include <iostream>和using namespace std;',
    solution: `#include <iostream>
using namespace std;

int main() {
    cout << 2024 << endl;
    return 0;
}`
  },
  {
    id: 'ex-01-03-08', title: '空白字符', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-03', orderIndex: 8, starterCode: '',
    questionData: {
      question: '以下哪种写法是正确的？',
      options: [
        { id: 'A', text: 'int a=10; 和 int a = 10; 都正确', correct: true },
        { id: 'B', text: '只有 int a=10; 正确', correct: false },
        { id: 'C', text: '只有 int a = 10; 正确', correct: false },
        { id: 'D', text: '两种都不正确', correct: false }
      ],
      explanation: 'C++中空格的多少不影响程序，但适当的空格能提高可读性'
    }
  },
  {
    id: 'ex-01-03-09', title: '修复结构错误', type: 'BUG_FIX' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 15, unitId: 'unit-01-intro', lessonId: 'lesson-01-03', orderIndex: 9, starterCode: '',
    questionData: {
      buggyCode: '#include <iostream>\nusing namespace std\n\nint main() {\n    cout << "Test";\n    return 0;\n}',
      bugs: [
        { line: 2, fix: 'using namespace std;', hint: '缺少分号' }
      ],
      correctCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Test";\n    return 0;\n}'
    }
  },
  {
    id: 'ex-01-03-10', title: '程序结构判断', type: 'MULTIPLE_CHOICE' as QuestionType, difficulty: 'EASY' as Difficulty,
    category: 'C++启航', xp: 10, unitId: 'unit-01-intro', lessonId: 'lesson-01-03', orderIndex: 10, starterCode: '',
    questionData: {
      question: '一个C++程序可以没有以下哪个部分？',
      options: [
        { id: 'A', text: '全局变量', correct: true },
        { id: 'B', text: 'main函数', correct: false },
        { id: 'C', text: '头文件（如果用到cout）', correct: false },
        { id: 'D', text: 'return语句', correct: false }
      ],
      explanation: '全局变量不是必须的，但main函数是程序入口，必须存在'
    }
  },
];
