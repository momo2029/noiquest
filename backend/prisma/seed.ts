import { PrismaClient, Difficulty, QuestionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 技能单元数据
const skillUnits = [
  {
    id: 'unit-basics',
    title: 'C++ 基础入门',
    description: '学习 C++ 的基本语法，包括输入输出、变量和数据类型',
    icon: '🚀',
    color: 'from-green-400 to-green-600',
    orderIndex: 1,
    requiredXp: 0,
    prerequisiteId: null,
  },
  {
    id: 'unit-conditionals',
    title: '条件语句',
    description: '掌握 if-else 条件判断和 switch 语句',
    icon: '🔀',
    color: 'from-blue-400 to-blue-600',
    orderIndex: 2,
    requiredXp: 50,
    prerequisiteId: 'unit-basics',
  },
  {
    id: 'unit-loops',
    title: '循环语句',
    description: '学习 for、while 和 do-while 循环',
    icon: '🔄',
    color: 'from-purple-400 to-purple-600',
    orderIndex: 3,
    requiredXp: 100,
    prerequisiteId: 'unit-conditionals',
  },
  {
    id: 'unit-arrays',
    title: '数组',
    description: '掌握一维数组和二维数组的使用',
    icon: '📊',
    color: 'from-orange-400 to-orange-600',
    orderIndex: 4,
    requiredXp: 200,
    prerequisiteId: 'unit-loops',
  },
  {
    id: 'unit-functions',
    title: '函数',
    description: '学习函数的定义、调用和参数传递',
    icon: '⚡',
    color: 'from-pink-400 to-pink-600',
    orderIndex: 5,
    requiredXp: 300,
    prerequisiteId: 'unit-arrays',
  },
  {
    id: 'unit-algorithms',
    title: '基础算法',
    description: '学习排序、查找等基础算法',
    icon: '🧮',
    color: 'from-red-400 to-red-600',
    orderIndex: 6,
    requiredXp: 400,
    prerequisiteId: 'unit-functions',
  },
];

// 课程数据
const lessons = [
  // 基础入门课程
  { id: 'lesson-hello', title: 'Hello World', description: '编写你的第一个 C++ 程序', orderIndex: 1, unitId: 'unit-basics' },
  { id: 'lesson-variables', title: '变量与数据类型', description: '学习声明和使用变量', orderIndex: 2, unitId: 'unit-basics' },
  { id: 'lesson-io', title: '输入与输出', description: '学习 cin 和 cout 的使用', orderIndex: 3, unitId: 'unit-basics' },
  { id: 'lesson-operators', title: '运算符', description: '学习算术和逻辑运算符', orderIndex: 4, unitId: 'unit-basics' },
  // 条件语句课程
  { id: 'lesson-if', title: 'if 语句', description: '学习基本的条件判断', orderIndex: 1, unitId: 'unit-conditionals' },
  { id: 'lesson-if-else', title: 'if-else 语句', description: '学习双分支条件判断', orderIndex: 2, unitId: 'unit-conditionals' },
  { id: 'lesson-nested-if', title: '嵌套条件', description: '学习多层条件判断', orderIndex: 3, unitId: 'unit-conditionals' },
  { id: 'lesson-switch', title: 'switch 语句', description: '学习多分支选择', orderIndex: 4, unitId: 'unit-conditionals' },
  // 循环语句课程
  { id: 'lesson-for', title: 'for 循环', description: '学习计数循环', orderIndex: 1, unitId: 'unit-loops' },
  { id: 'lesson-while', title: 'while 循环', description: '学习条件循环', orderIndex: 2, unitId: 'unit-loops' },
  { id: 'lesson-nested-loop', title: '嵌套循环', description: '学习循环嵌套', orderIndex: 3, unitId: 'unit-loops' },
  { id: 'lesson-break-continue', title: 'break 与 continue', description: '学习循环控制', orderIndex: 4, unitId: 'unit-loops' },
  // 数组课程
  { id: 'lesson-array-basics', title: '数组基础', description: '学习一维数组', orderIndex: 1, unitId: 'unit-arrays' },
  { id: 'lesson-array-traverse', title: '数组遍历', description: '学习遍历数组元素', orderIndex: 2, unitId: 'unit-arrays' },
  { id: 'lesson-2d-array', title: '二维数组', description: '学习二维数组', orderIndex: 3, unitId: 'unit-arrays' },
  { id: 'lesson-string', title: '字符串', description: '学习字符数组和 string', orderIndex: 4, unitId: 'unit-arrays' },
  // 函数课程
  { id: 'lesson-func-basics', title: '函数基础', description: '学习定义和调用函数', orderIndex: 1, unitId: 'unit-functions' },
  { id: 'lesson-func-params', title: '函数参数', description: '学习参数传递', orderIndex: 2, unitId: 'unit-functions' },
  { id: 'lesson-func-return', title: '返回值', description: '学习函数返回值', orderIndex: 3, unitId: 'unit-functions' },
  { id: 'lesson-recursion', title: '递归', description: '学习递归函数', orderIndex: 4, unitId: 'unit-functions' },
  // 算法课程
  { id: 'lesson-bubble-sort', title: '冒泡排序', description: '学习冒泡排序算法', orderIndex: 1, unitId: 'unit-algorithms' },
  { id: 'lesson-selection-sort', title: '选择排序', description: '学习选择排序算法', orderIndex: 2, unitId: 'unit-algorithms' },
  { id: 'lesson-linear-search', title: '线性查找', description: '学习顺序查找', orderIndex: 3, unitId: 'unit-algorithms' },
  { id: 'lesson-binary-search', title: '二分查找', description: '学习二分查找算法', orderIndex: 4, unitId: 'unit-algorithms' },
];

// 每日任务模板
const dailyQuestTemplates = [
  { id: 'quest-complete-3', title: '完成3道题目', description: '今天完成3道练习题', questType: 'complete_exercises', targetValue: 3, xpReward: 15, gemsReward: 1 },
  { id: 'quest-complete-5', title: '完成5道题目', description: '今天完成5道练习题', questType: 'complete_exercises', targetValue: 5, xpReward: 25, gemsReward: 2 },
  { id: 'quest-perfect-1', title: '完美通关', description: '不犯错完成1个课程', questType: 'perfect_lessons', targetValue: 1, xpReward: 20, gemsReward: 2 },
  { id: 'quest-earn-50xp', title: '获得50XP', description: '今天获得50点经验值', questType: 'earn_xp', targetValue: 50, xpReward: 10, gemsReward: 1 },
  { id: 'quest-review-5', title: '复习5道题', description: '复习5道之前做过的题目', questType: 'review_exercises', targetValue: 5, xpReward: 15, gemsReward: 1 },
];

// 多样化题型练习
const diverseExercises = [
  // 填空题
  {
    id: 'fill-blank-1',
    title: '变量声明填空',
    description: '填写正确的代码完成变量声明和输出',
    difficulty: 'EASY' as Difficulty,
    category: '基础入门',
    type: 'FILL_BLANK' as QuestionType,
    xp: 10,
    orderIndex: 101,
    unitId: 'unit-basics',
    lessonId: 'lesson-variables',
    starterCode: '',
    questionData: {
      code: 'int x = ___BLANK_1___;\ncout << x ___BLANK_2___ 5;',
      blanks: [
        { id: 'BLANK_1', answer: '10', hint: '整数值', alternatives: ['10'] },
        { id: 'BLANK_2', answer: '+', hint: '运算符', alternatives: ['+'] }
      ]
    }
  },
  {
    id: 'fill-blank-2',
    title: 'for循环填空',
    description: '填写正确的代码完成1到5的循环',
    difficulty: 'EASY' as Difficulty,
    category: '循环语句',
    type: 'FILL_BLANK' as QuestionType,
    xp: 15,
    orderIndex: 102,
    unitId: 'unit-loops',
    lessonId: 'lesson-for',
    starterCode: '',
    questionData: {
      code: 'for (int i = ___BLANK_1___; i ___BLANK_2___ 5; i++) {\n    cout << i << endl;\n}',
      blanks: [
        { id: 'BLANK_1', answer: '1', hint: '起始值', alternatives: ['1'] },
        { id: 'BLANK_2', answer: '<=', hint: '比较运算符', alternatives: ['<='] }
      ]
    }
  },
  // 排序题
  {
    id: 'code-order-1',
    title: '排列输出代码',
    description: '将代码行排列成正确的顺序，实现输出 1 到 5',
    difficulty: 'EASY' as Difficulty,
    category: '循环语句',
    type: 'CODE_ORDER' as QuestionType,
    xp: 15,
    orderIndex: 103,
    unitId: 'unit-loops',
    lessonId: 'lesson-for',
    starterCode: '',
    questionData: {
      description: '排列代码实现输出 1-5',
      lines: [
        { id: '1', code: 'for (int i = 1; i <= 5; i++) {', order: 1 },
        { id: '2', code: '    cout << i << endl;', order: 2 },
        { id: '3', code: '}', order: 3 }
      ]
    }
  },
  {
    id: 'code-order-2',
    title: '排列条件判断代码',
    description: '将代码行排列成正确的顺序，实现判断正负数',
    difficulty: 'EASY' as Difficulty,
    category: '条件语句',
    type: 'CODE_ORDER' as QuestionType,
    xp: 15,
    orderIndex: 104,
    unitId: 'unit-conditionals',
    lessonId: 'lesson-if-else',
    starterCode: '',
    questionData: {
      description: '排列代码判断数字是正数还是负数',
      lines: [
        { id: '1', code: 'if (num > 0) {', order: 1 },
        { id: '2', code: '    cout << "正数" << endl;', order: 2 },
        { id: '3', code: '} else {', order: 3 },
        { id: '4', code: '    cout << "负数或零" << endl;', order: 4 },
        { id: '5', code: '}', order: 5 }
      ]
    }
  },
  // 选择题
  {
    id: 'multiple-choice-1',
    title: '后置递增运算',
    description: '选择正确的输出结果',
    difficulty: 'EASY' as Difficulty,
    category: '基础入门',
    type: 'MULTIPLE_CHOICE' as QuestionType,
    xp: 10,
    orderIndex: 105,
    unitId: 'unit-basics',
    lessonId: 'lesson-operators',
    starterCode: '',
    questionData: {
      question: 'int x = 5; cout << x++;  输出什么？',
      options: [
        { id: 'A', text: '5', correct: true },
        { id: 'B', text: '6', correct: false },
        { id: 'C', text: '4', correct: false },
        { id: 'D', text: '编译错误', correct: false }
      ],
      explanation: '后置递增 x++ 先返回当前值 5，然后 x 变成 6'
    }
  },
  {
    id: 'multiple-choice-2',
    title: '数组下标',
    description: '选择正确的数组访问方式',
    difficulty: 'EASY' as Difficulty,
    category: '数组',
    type: 'MULTIPLE_CHOICE' as QuestionType,
    xp: 10,
    orderIndex: 106,
    unitId: 'unit-arrays',
    lessonId: 'lesson-array-basics',
    starterCode: '',
    questionData: {
      question: 'int arr[5] = {1, 2, 3, 4, 5}; 访问第三个元素应该用？',
      options: [
        { id: 'A', text: 'arr[3]', correct: false },
        { id: 'B', text: 'arr[2]', correct: true },
        { id: 'C', text: 'arr(3)', correct: false },
        { id: 'D', text: 'arr{2}', correct: false }
      ],
      explanation: '数组下标从 0 开始，第三个元素的下标是 2'
    }
  },
  // 配对题
  {
    id: 'matching-1',
    title: '代码功能配对',
    description: '将代码与其功能配对',
    difficulty: 'EASY' as Difficulty,
    category: '基础入门',
    type: 'MATCHING' as QuestionType,
    xp: 15,
    orderIndex: 107,
    unitId: 'unit-basics',
    lessonId: 'lesson-io',
    starterCode: '',
    questionData: {
      left: [
        { id: 'L1', text: '声明变量' },
        { id: 'L2', text: '输出' },
        { id: 'L3', text: '输入' },
        { id: 'L4', text: '换行' }
      ],
      right: [
        { id: 'R1', text: 'int x = 10;' },
        { id: 'R2', text: 'cout << x;' },
        { id: 'R3', text: 'cin >> x;' },
        { id: 'R4', text: 'endl' }
      ],
      pairs: [['L1', 'R1'], ['L2', 'R2'], ['L3', 'R3'], ['L4', 'R4']]
    }
  },
  {
    id: 'matching-2',
    title: '循环类型配对',
    description: '将循环类型与其特点配对',
    difficulty: 'MEDIUM' as Difficulty,
    category: '循环语句',
    type: 'MATCHING' as QuestionType,
    xp: 20,
    orderIndex: 108,
    unitId: 'unit-loops',
    lessonId: 'lesson-while',
    starterCode: '',
    questionData: {
      left: [
        { id: 'L1', text: 'for 循环' },
        { id: 'L2', text: 'while 循环' },
        { id: 'L3', text: 'do-while 循环' }
      ],
      right: [
        { id: 'R1', text: '已知循环次数' },
        { id: 'R2', text: '先判断后执行' },
        { id: 'R3', text: '至少执行一次' }
      ],
      pairs: [['L1', 'R1'], ['L2', 'R2'], ['L3', 'R3']]
    }
  },
  // 改错题
  {
    id: 'bug-fix-1',
    title: '修复语法错误',
    description: '找出并修复代码中的语法错误',
    difficulty: 'MEDIUM' as Difficulty,
    category: '基础入门',
    type: 'BUG_FIX' as QuestionType,
    xp: 20,
    orderIndex: 109,
    unitId: 'unit-basics',
    lessonId: 'lesson-hello',
    starterCode: '',
    questionData: {
      buggyCode: 'int sum = 0\nfor (i = 0; i < 5; i++)\n    sum += i;',
      bugs: [
        { line: 1, fix: 'int sum = 0;', hint: '缺少分号' },
        { line: 2, fix: 'for (int i = 0; i < 5; i++) {', hint: '缺少类型声明和大括号' }
      ],
      correctCode: 'int sum = 0;\nfor (int i = 0; i < 5; i++) {\n    sum += i;\n}'
    }
  },
  {
    id: 'bug-fix-2',
    title: '修复逻辑错误',
    description: '找出并修复代码中的逻辑错误',
    difficulty: 'MEDIUM' as Difficulty,
    category: '循环语句',
    type: 'BUG_FIX' as QuestionType,
    xp: 25,
    orderIndex: 110,
    unitId: 'unit-loops',
    lessonId: 'lesson-for',
    starterCode: '',
    questionData: {
      buggyCode: 'int sum = 0;\nfor (int i = 1; i < 10; i++) {\n    sum += i;\n}\ncout << sum;  // 应该输出 1+2+...+10 = 55',
      bugs: [
        { line: 2, fix: 'for (int i = 1; i <= 10; i++) {', hint: '循环条件应该包含 10' }
      ],
      correctCode: 'int sum = 0;\nfor (int i = 1; i <= 10; i++) {\n    sum += i;\n}\ncout << sum;'
    }
  }
];

const exercises = [
  {
    title: 'Hello World',
    description: '编写你的第一个C++程序，在屏幕上输出 "Hello, World!"',
    difficulty: 'EASY' as Difficulty,
    category: '基础入门',
    xp: 10,
    orderIndex: 1,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // 在这里编写代码，输出 Hello, World!

    return 0;
}`,
    hint: '使用 cout << "Hello, World!" << endl; 来输出文字',
    solution: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`
  },
  {
    title: '变量与输入',
    description: '声明一个整数变量，从键盘读取一个数字，然后输出这个数字的两倍',
    difficulty: 'EASY' as Difficulty,
    category: '基础入门',
    xp: 15,
    orderIndex: 2,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // 声明变量
    // 读取输入
    // 输出两倍的值

    return 0;
}`,
    hint: '使用 cin >> 变量名; 来读取输入',
    solution: `#include <iostream>
using namespace std;

int main() {
    int num;
    cin >> num;
    cout << num * 2 << endl;
    return 0;
}`
  },
  {
    title: '条件判断',
    description: '读取一个整数，判断它是正数、负数还是零',
    difficulty: 'EASY' as Difficulty,
    category: '条件语句',
    xp: 20,
    orderIndex: 3,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int num;
    cin >> num;

    // 使用 if-else 判断并输出结果

    return 0;
}`,
    hint: '使用 if (num > 0) 判断正数',
    solution: `#include <iostream>
using namespace std;

int main() {
    int num;
    cin >> num;

    if (num > 0) {
        cout << "正数" << endl;
    } else if (num < 0) {
        cout << "负数" << endl;
    } else {
        cout << "零" << endl;
    }

    return 0;
}`
  },
  {
    title: '求最大值',
    description: '读取三个整数，找出并输出其中的最大值',
    difficulty: 'EASY' as Difficulty,
    category: '条件语句',
    xp: 20,
    orderIndex: 4,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;

    // 找出最大值并输出

    return 0;
}`,
    hint: '可以先比较两个数，再用结果和第三个数比较',
    solution: `#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;

    int maxVal = a;
    if (b > maxVal) maxVal = b;
    if (c > maxVal) maxVal = c;

    cout << maxVal << endl;
    return 0;
}`
  },
  {
    title: '计算1到N的和',
    description: '读取一个正整数N，计算并输出1+2+3+...+N的结果',
    difficulty: 'EASY' as Difficulty,
    category: '循环语句',
    xp: 25,
    orderIndex: 5,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // 使用循环计算1到n的和

    return 0;
}`,
    hint: '使用 for 循环从1遍历到n',
    solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }

    cout << sum << endl;
    return 0;
}`
  },
  {
    title: '九九乘法表',
    description: '使用嵌套循环输出九九乘法表',
    difficulty: 'MEDIUM' as Difficulty,
    category: '循环语句',
    xp: 35,
    orderIndex: 6,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // 使用嵌套循环输出九九乘法表

    return 0;
}`,
    hint: '外层循环控制行，内层循环控制列',
    solution: `#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 9; i++) {
        for (int j = 1; j <= i; j++) {
            cout << j << "*" << i << "=" << i*j << "\\t";
        }
        cout << endl;
    }
    return 0;
}`
  },
  {
    title: '判断素数',
    description: '读取一个正整数，判断它是否为素数',
    difficulty: 'MEDIUM' as Difficulty,
    category: '循环语句',
    xp: 40,
    orderIndex: 7,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // 判断n是否为素数

    return 0;
}`,
    hint: '素数只能被1和自身整除',
    solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    if (n < 2) {
        cout << "不是素数" << endl;
        return 0;
    }

    bool isPrime = true;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            isPrime = false;
            break;
        }
    }

    cout << (isPrime ? "是素数" : "不是素数") << endl;
    return 0;
}`
  },
  {
    title: '数组求和',
    description: '读取5个整数存入数组，计算并输出它们的和与平均值',
    difficulty: 'MEDIUM' as Difficulty,
    category: '数组',
    xp: 35,
    orderIndex: 8,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int arr[5];

    // 读取5个整数
    // 计算和与平均值

    return 0;
}`,
    hint: '使用循环读取和累加',
    solution: `#include <iostream>
using namespace std;

int main() {
    int arr[5];

    for (int i = 0; i < 5; i++) {
        cin >> arr[i];
    }

    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += arr[i];
    }

    cout << "和: " << sum << endl;
    cout << "平均值: " << sum / 5.0 << endl;

    return 0;
}`
  },
  {
    title: '冒泡排序',
    description: '读取5个整数，使用冒泡排序从小到大排序后输出',
    difficulty: 'MEDIUM' as Difficulty,
    category: '数组',
    xp: 45,
    orderIndex: 9,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int arr[5];

    for (int i = 0; i < 5; i++) {
        cin >> arr[i];
    }

    // 实现冒泡排序
    // 输出排序后的数组

    return 0;
}`,
    hint: '相邻元素比较，如果前面的大就交换',
    solution: `#include <iostream>
using namespace std;

int main() {
    int arr[5];

    for (int i = 0; i < 5; i++) {
        cin >> arr[i];
    }

    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }

    for (int i = 0; i < 5; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;

    return 0;
}`
  },
  {
    title: '二分查找',
    description: '在有序数组中使用二分查找法查找目标值',
    difficulty: 'HARD' as Difficulty,
    category: '算法',
    xp: 60,
    orderIndex: 10,
    starterCode: `#include <iostream>
using namespace std;

int binarySearch(int arr[], int n, int target) {
    // 实现二分查找
}

int main() {
    int arr[] = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
    int n = 10;
    int target;
    cin >> target;

    int result = binarySearch(arr, n, target);
    if (result != -1) {
        cout << "找到，下标为: " << result << endl;
    } else {
        cout << "未找到" << endl;
    }

    return 0;
}`,
    hint: '每次比较中间元素，缩小一半搜索范围',
    solution: `#include <iostream>
using namespace std;

int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

int main() {
    int arr[] = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
    int n = 10;
    int target;
    cin >> target;

    int result = binarySearch(arr, n, target);
    if (result != -1) {
        cout << "找到，下标为: " << result << endl;
    } else {
        cout << "未找到" << endl;
    }

    return 0;
}`
  },
];

const achievements = [
  {
    key: 'first-code',
    name: '初出茅庐',
    description: '完成第一道编程题',
    icon: '🎯',
    category: 'MILESTONE',
    condition: { type: 'exercisesCompleted', value: 1 },
    reward: { xp: 20, gems: 5 },
    rarity: 'COMMON',
    orderIndex: 1
  },
  {
    key: 'streak-3',
    name: '三天打鱼',
    description: '连续学习3天',
    icon: '🔥',
    category: 'STREAK',
    condition: { type: 'streak', value: 3 },
    reward: { xp: 30, gems: 10 },
    rarity: 'COMMON',
    orderIndex: 2
  },
  {
    key: 'streak-7',
    name: '一周坚持',
    description: '连续学习7天',
    icon: '💪',
    category: 'STREAK',
    condition: { type: 'streak', value: 7 },
    reward: { xp: 50, gems: 20 },
    rarity: 'RARE',
    orderIndex: 3
  },
  {
    key: 'streak-30',
    name: '月度学霸',
    description: '连续学习30天',
    icon: '👑',
    category: 'STREAK',
    condition: { type: 'streak', value: 30 },
    reward: { xp: 200, gems: 100 },
    rarity: 'EPIC',
    orderIndex: 4
  },
  {
    key: 'complete-5',
    name: '小试牛刀',
    description: '完成5道编程题',
    icon: '⭐',
    category: 'MILESTONE',
    condition: { type: 'exercisesCompleted', value: 5 },
    reward: { xp: 50, gems: 15 },
    rarity: 'COMMON',
    orderIndex: 5
  },
  {
    key: 'complete-10',
    name: '渐入佳境',
    description: '完成10道编程题',
    icon: '🌟',
    category: 'MILESTONE',
    condition: { type: 'exercisesCompleted', value: 10 },
    reward: { xp: 100, gems: 30 },
    rarity: 'RARE',
    orderIndex: 6
  },
  {
    key: 'level-5',
    name: '初级程序员',
    description: '达到5级',
    icon: '💻',
    category: 'MILESTONE',
    condition: { type: 'level', value: 5 },
    reward: { xp: 50, gems: 20 },
    rarity: 'COMMON',
    orderIndex: 7
  },
  {
    key: 'level-10',
    name: '中级程序员',
    description: '达到10级',
    icon: '🖥️',
    category: 'MILESTONE',
    condition: { type: 'level', value: 10 },
    reward: { xp: 100, gems: 50 },
    rarity: 'RARE',
    orderIndex: 8
  },
  {
    key: 'csp-j-ready',
    name: 'CSP-J 预备',
    description: '完成所有基础和中等难度题目',
    icon: '🎖️',
    category: 'COLLECTION',
    condition: { type: 'completeEasyMedium', value: 1 },
    reward: { xp: 200, gems: 100 },
    rarity: 'LEGENDARY',
    orderIndex: 9
  },
];

async function main() {
  console.log('🌱 开始初始化数据库...');

  // 创建技能单元
  console.log('🎯 创建技能单元...');
  for (const unit of skillUnits) {
    await prisma.skillUnit.upsert({
      where: { id: unit.id },
      update: { ...unit, prerequisiteId: unit.prerequisiteId },
      create: { ...unit, prerequisiteId: unit.prerequisiteId },
    });
  }

  // 创建课程
  console.log('📖 创建课程...');
  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { id: lesson.id },
      update: lesson,
      create: lesson,
    });
  }

  // 创建每日任务模板
  console.log('📋 创建每日任务模板...');
  for (const template of dailyQuestTemplates) {
    await prisma.dailyQuestTemplate.upsert({
      where: { id: template.id },
      update: template,
      create: template,
    });
  }

  // 创建练习题
  console.log('📝 创建练习题...');
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { id: exercise.title },
      update: exercise,
      create: exercise,
    });
  }

  // 创建多样化题型练习
  console.log('🎮 创建多样化题型练习...');
  for (const exercise of diverseExercises) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: exercise,
      create: exercise,
    });
  }

  // 创建成就
  console.log('🏆 创建成就...');
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  // 创建测试用户
  console.log('👤 创建测试用户...');
  const hashedPassword = await bcrypt.hash('123456', 12);

  await prisma.user.upsert({
    where: { username: 'teacher' },
    update: {},
    create: {
      username: 'teacher',
      email: 'teacher@test.com',
      password: hashedPassword,
      name: '张老师',
      role: 'TEACHER',
      avatar: '👨‍🏫',
    },
  });

  await prisma.user.upsert({
    where: { username: 'student' },
    update: {},
    create: {
      username: 'student',
      email: 'student@test.com',
      password: hashedPassword,
      name: '小明',
      role: 'STUDENT',
      avatar: '🦊',
    },
  });

  // 创建管理员账户
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@28920.com',
      password: hashedPassword,
      name: '系统管理员',
      role: 'ADMIN',
      avatar: '👑',
      level: 99,
      xp: 99999,
      totalXp: 99999,
      gems: 9999,
    },
  });

  console.log('✅ 数据库初始化完成！');
  console.log('');
  console.log('测试账号：');
  console.log('  教师: teacher@test.com / 123456');
  console.log('  学生: student@test.com / 123456');
  console.log('  管理员: admin@28920.com / 123456');
  console.log('');
  console.log('⚠️  请尽快修改管理员默认密码！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
