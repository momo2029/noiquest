import { PrismaClient, Difficulty, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== 10个技能单元 ====================
// 按照初中生认知水平，从基础到进阶，涵盖NOI所需知识点

export const skillUnits = [
  {
    id: 'unit-01-intro',
    title: 'C++ 启航',
    description: '认识C++编程环境，学习基本输入输出，迈出编程第一步',
    icon: '🚀',
    color: 'from-green-400 to-green-600',
    orderIndex: 1,
    requiredXp: 0,
    prerequisiteId: null,
  },
  {
    id: 'unit-02-variables',
    title: '变量与运算',
    description: '掌握各种数据类型、变量声明和基本运算符的使用',
    icon: '📦',
    color: 'from-blue-400 to-blue-600',
    orderIndex: 2,
    requiredXp: 100,
    prerequisiteId: 'unit-01-intro',
  },
  {
    id: 'unit-03-conditions',
    title: '条件判断',
    description: '学习if-else条件语句和switch多分支选择',
    icon: '🔀',
    color: 'from-purple-400 to-purple-600',
    orderIndex: 3,
    requiredXp: 250,
    prerequisiteId: 'unit-02-variables',
  },
  {
    id: 'unit-04-loops',
    title: '循环结构',
    description: '掌握for、while循环，学会用循环解决重复性问题',
    icon: '🔄',
    color: 'from-orange-400 to-orange-600',
    orderIndex: 4,
    requiredXp: 450,
    prerequisiteId: 'unit-03-conditions',
  },
  {
    id: 'unit-05-arrays',
    title: '数组基础',
    description: '学习一维数组和二维数组的声明、访问和遍历',
    icon: '📊',
    color: 'from-pink-400 to-pink-600',
    orderIndex: 5,
    requiredXp: 700,
    prerequisiteId: 'unit-04-loops',
  },
  {
    id: 'unit-06-strings',
    title: '字符串处理',
    description: '掌握字符数组和string类的使用，学习常见字符串操作',
    icon: '📝',
    color: 'from-cyan-400 to-cyan-600',
    orderIndex: 6,
    requiredXp: 1000,
    prerequisiteId: 'unit-05-arrays',
  },
  {
    id: 'unit-07-functions',
    title: '函数与递归',
    description: '学习函数定义、参数传递和递归思想',
    icon: '⚡',
    color: 'from-yellow-400 to-yellow-600',
    orderIndex: 7,
    requiredXp: 1350,
    prerequisiteId: 'unit-06-strings',
  },
  {
    id: 'unit-08-sorting',
    title: '排序算法',
    description: '掌握冒泡、选择、插入排序，了解快速排序和归并排序',
    icon: '📈',
    color: 'from-red-400 to-red-600',
    orderIndex: 8,
    requiredXp: 1750,
    prerequisiteId: 'unit-07-functions',
  },
  {
    id: 'unit-09-search',
    title: '查找与枚举',
    description: '学习顺序查找、二分查找和枚举算法',
    icon: '🔍',
    color: 'from-indigo-400 to-indigo-600',
    orderIndex: 9,
    requiredXp: 2200,
    prerequisiteId: 'unit-08-sorting',
  },
  {
    id: 'unit-10-advanced',
    title: 'NOI入门算法',
    description: '学习模拟、贪心、简单动态规划等NOI基础算法',
    icon: '🏆',
    color: 'from-amber-400 to-amber-600',
    orderIndex: 10,
    requiredXp: 2700,
    prerequisiteId: 'unit-09-search',
  },
];

// ==================== 100门课程（每单元10门） ====================

export const lessons = [
  // ===== 单元1: C++ 启航 =====
  { id: 'lesson-01-01', title: '认识C++', description: '了解C++语言的历史和特点', orderIndex: 1, unitId: 'unit-01-intro' },
  { id: 'lesson-01-02', title: '第一个程序', description: '编写Hello World程序', orderIndex: 2, unitId: 'unit-01-intro' },
  { id: 'lesson-01-03', title: '程序结构', description: '理解C++程序的基本结构', orderIndex: 3, unitId: 'unit-01-intro' },
  { id: 'lesson-01-04', title: '输出语句', description: '学习cout输出各种内容', orderIndex: 4, unitId: 'unit-01-intro' },
  { id: 'lesson-01-05', title: '输入语句', description: '学习cin读取用户输入', orderIndex: 5, unitId: 'unit-01-intro' },
  { id: 'lesson-01-06', title: '注释', description: '学习单行和多行注释', orderIndex: 6, unitId: 'unit-01-intro' },
  { id: 'lesson-01-07', title: '转义字符', description: '学习换行、制表符等转义字符', orderIndex: 7, unitId: 'unit-01-intro' },
  { id: 'lesson-01-08', title: '格式化输出', description: '学习控制输出格式', orderIndex: 8, unitId: 'unit-01-intro' },
  { id: 'lesson-01-09', title: '编译错误', description: '认识常见编译错误并学会修复', orderIndex: 9, unitId: 'unit-01-intro' },
  { id: 'lesson-01-10', title: '综合练习', description: '综合运用本单元知识', orderIndex: 10, unitId: 'unit-01-intro' },

  // ===== 单元2: 变量与运算 =====
  { id: 'lesson-02-01', title: '整数类型', description: '学习int、long long等整数类型', orderIndex: 1, unitId: 'unit-02-variables' },
  { id: 'lesson-02-02', title: '浮点类型', description: '学习float和double类型', orderIndex: 2, unitId: 'unit-02-variables' },
  { id: 'lesson-02-03', title: '字符类型', description: '学习char类型和ASCII码', orderIndex: 3, unitId: 'unit-02-variables' },
  { id: 'lesson-02-04', title: '布尔类型', description: '学习bool类型和逻辑值', orderIndex: 4, unitId: 'unit-02-variables' },
  { id: 'lesson-02-05', title: '算术运算', description: '学习加减乘除和取模运算', orderIndex: 5, unitId: 'unit-02-variables' },
  { id: 'lesson-02-06', title: '赋值运算', description: '学习赋值和复合赋值运算符', orderIndex: 6, unitId: 'unit-02-variables' },
  { id: 'lesson-02-07', title: '自增自减', description: '学习++和--运算符', orderIndex: 7, unitId: 'unit-02-variables' },
  { id: 'lesson-02-08', title: '类型转换', description: '学习隐式和显式类型转换', orderIndex: 8, unitId: 'unit-02-variables' },
  { id: 'lesson-02-09', title: '常量', description: '学习const常量和#define宏', orderIndex: 9, unitId: 'unit-02-variables' },
  { id: 'lesson-02-10', title: '综合练习', description: '综合运用变量和运算知识', orderIndex: 10, unitId: 'unit-02-variables' },

  // ===== 单元3: 条件判断 =====
  { id: 'lesson-03-01', title: '关系运算符', description: '学习大于、小于、等于等比较', orderIndex: 1, unitId: 'unit-03-conditions' },
  { id: 'lesson-03-02', title: '逻辑运算符', description: '学习与、或、非逻辑运算', orderIndex: 2, unitId: 'unit-03-conditions' },
  { id: 'lesson-03-03', title: 'if语句', description: '学习单分支条件判断', orderIndex: 3, unitId: 'unit-03-conditions' },
  { id: 'lesson-03-04', title: 'if-else语句', description: '学习双分支条件判断', orderIndex: 4, unitId: 'unit-03-conditions' },
  { id: 'lesson-03-05', title: 'else if语句', description: '学习多分支条件判断', orderIndex: 5, unitId: 'unit-03-conditions' },
  { id: 'lesson-03-06', title: '嵌套if', description: '学习条件语句的嵌套使用', orderIndex: 6, unitId: 'unit-03-conditions' },
  { id: 'lesson-03-07', title: 'switch语句', description: '学习多值选择的switch结构', orderIndex: 7, unitId: 'unit-03-conditions' },
  { id: 'lesson-03-08', title: '条件运算符', description: '学习三目运算符?:', orderIndex: 8, unitId: 'unit-03-conditions' },
  { id: 'lesson-03-09', title: '条件综合', description: '复杂条件判断的组合使用', orderIndex: 9, unitId: 'unit-03-conditions' },
  { id: 'lesson-03-10', title: '综合练习', description: '综合运用条件判断知识', orderIndex: 10, unitId: 'unit-03-conditions' },

  // ===== 单元4: 循环结构 =====
  { id: 'lesson-04-01', title: 'while循环', description: '学习while循环的基本用法', orderIndex: 1, unitId: 'unit-04-loops' },
  { id: 'lesson-04-02', title: 'do-while循环', description: '学习先执行后判断的循环', orderIndex: 2, unitId: 'unit-04-loops' },
  { id: 'lesson-04-03', title: 'for循环', description: '学习计数循环for的用法', orderIndex: 3, unitId: 'unit-04-loops' },
  { id: 'lesson-04-04', title: '循环控制', description: '学习break和continue语句', orderIndex: 4, unitId: 'unit-04-loops' },
  { id: 'lesson-04-05', title: '累加累乘', description: '用循环实现求和与求积', orderIndex: 5, unitId: 'unit-04-loops' },
  { id: 'lesson-04-06', title: '计数统计', description: '用循环进行计数和统计', orderIndex: 6, unitId: 'unit-04-loops' },
  { id: 'lesson-04-07', title: '嵌套循环', description: '学习循环的嵌套使用', orderIndex: 7, unitId: 'unit-04-loops' },
  { id: 'lesson-04-08', title: '图形打印', description: '用嵌套循环打印各种图形', orderIndex: 8, unitId: 'unit-04-loops' },
  { id: 'lesson-04-09', title: '循环优化', description: '学习提前退出等优化技巧', orderIndex: 9, unitId: 'unit-04-loops' },
  { id: 'lesson-04-10', title: '综合练习', description: '综合运用循环结构知识', orderIndex: 10, unitId: 'unit-04-loops' },

  // ===== 单元5: 数组基础 =====
  { id: 'lesson-05-01', title: '数组声明', description: '学习一维数组的声明和初始化', orderIndex: 1, unitId: 'unit-05-arrays' },
  { id: 'lesson-05-02', title: '数组访问', description: '学习通过下标访问数组元素', orderIndex: 2, unitId: 'unit-05-arrays' },
  { id: 'lesson-05-03', title: '数组遍历', description: '用循环遍历数组所有元素', orderIndex: 3, unitId: 'unit-05-arrays' },
  { id: 'lesson-05-04', title: '数组输入输出', description: '读取和输出数组数据', orderIndex: 4, unitId: 'unit-05-arrays' },
  { id: 'lesson-05-05', title: '数组求和', description: '计算数组元素的和与平均值', orderIndex: 5, unitId: 'unit-05-arrays' },
  { id: 'lesson-05-06', title: '最值查找', description: '找出数组中的最大最小值', orderIndex: 6, unitId: 'unit-05-arrays' },
  { id: 'lesson-05-07', title: '数组统计', description: '统计满足条件的元素个数', orderIndex: 7, unitId: 'unit-05-arrays' },
  { id: 'lesson-05-08', title: '二维数组', description: '学习二维数组的声明和使用', orderIndex: 8, unitId: 'unit-05-arrays' },
  { id: 'lesson-05-09', title: '矩阵操作', description: '二维数组的遍历和基本操作', orderIndex: 9, unitId: 'unit-05-arrays' },
  { id: 'lesson-05-10', title: '综合练习', description: '综合运用数组知识', orderIndex: 10, unitId: 'unit-05-arrays' },

  // ===== 单元6: 字符串处理 =====
  { id: 'lesson-06-01', title: '字符数组', description: '学习C风格字符串', orderIndex: 1, unitId: 'unit-06-strings' },
  { id: 'lesson-06-02', title: 'string类型', description: '学习C++ string类的基本用法', orderIndex: 2, unitId: 'unit-06-strings' },
  { id: 'lesson-06-03', title: '字符串输入', description: '学习cin、getline读取字符串', orderIndex: 3, unitId: 'unit-06-strings' },
  { id: 'lesson-06-04', title: '字符串长度', description: '获取字符串长度的方法', orderIndex: 4, unitId: 'unit-06-strings' },
  { id: 'lesson-06-05', title: '字符串遍历', description: '遍历字符串中的每个字符', orderIndex: 5, unitId: 'unit-06-strings' },
  { id: 'lesson-06-06', title: '字符串拼接', description: '学习字符串的连接操作', orderIndex: 6, unitId: 'unit-06-strings' },
  { id: 'lesson-06-07', title: '字符串比较', description: '学习字符串的比较方法', orderIndex: 7, unitId: 'unit-06-strings' },
  { id: 'lesson-06-08', title: '子串操作', description: '学习截取和查找子串', orderIndex: 8, unitId: 'unit-06-strings' },
  { id: 'lesson-06-09', title: '字符处理', description: '大小写转换、字符判断等', orderIndex: 9, unitId: 'unit-06-strings' },
  { id: 'lesson-06-10', title: '综合练习', description: '综合运用字符串知识', orderIndex: 10, unitId: 'unit-06-strings' },

  // ===== 单元7: 函数与递归 =====
  { id: 'lesson-07-01', title: '函数定义', description: '学习定义和调用函数', orderIndex: 1, unitId: 'unit-07-functions' },
  { id: 'lesson-07-02', title: '函数参数', description: '学习形参和实参的传递', orderIndex: 2, unitId: 'unit-07-functions' },
  { id: 'lesson-07-03', title: '返回值', description: '学习函数返回值的使用', orderIndex: 3, unitId: 'unit-07-functions' },
  { id: 'lesson-07-04', title: '引用传递', description: '学习引用参数的使用', orderIndex: 4, unitId: 'unit-07-functions' },
  { id: 'lesson-07-05', title: '数组参数', description: '学习将数组传递给函数', orderIndex: 5, unitId: 'unit-07-functions' },
  { id: 'lesson-07-06', title: '函数重载', description: '学习同名函数的重载', orderIndex: 6, unitId: 'unit-07-functions' },
  { id: 'lesson-07-07', title: '递归入门', description: '理解递归的基本概念', orderIndex: 7, unitId: 'unit-07-functions' },
  { id: 'lesson-07-08', title: '递归应用', description: '用递归解决实际问题', orderIndex: 8, unitId: 'unit-07-functions' },
  { id: 'lesson-07-09', title: '递归与循环', description: '递归和循环的转换', orderIndex: 9, unitId: 'unit-07-functions' },
  { id: 'lesson-07-10', title: '综合练习', description: '综合运用函数和递归', orderIndex: 10, unitId: 'unit-07-functions' },

  // ===== 单元8: 排序算法 =====
  { id: 'lesson-08-01', title: '排序概念', description: '理解排序的基本概念和稳定性', orderIndex: 1, unitId: 'unit-08-sorting' },
  { id: 'lesson-08-02', title: '冒泡排序', description: '学习冒泡排序算法', orderIndex: 2, unitId: 'unit-08-sorting' },
  { id: 'lesson-08-03', title: '选择排序', description: '学习选择排序算法', orderIndex: 3, unitId: 'unit-08-sorting' },
  { id: 'lesson-08-04', title: '插入排序', description: '学习插入排序算法', orderIndex: 4, unitId: 'unit-08-sorting' },
  { id: 'lesson-08-05', title: '排序优化', description: '学习排序算法的优化技巧', orderIndex: 5, unitId: 'unit-08-sorting' },
  { id: 'lesson-08-06', title: '快速排序', description: '了解快速排序的思想', orderIndex: 6, unitId: 'unit-08-sorting' },
  { id: 'lesson-08-07', title: '归并排序', description: '了解归并排序的思想', orderIndex: 7, unitId: 'unit-08-sorting' },
  { id: 'lesson-08-08', title: 'sort函数', description: '学习使用STL的sort函数', orderIndex: 8, unitId: 'unit-08-sorting' },
  { id: 'lesson-08-09', title: '自定义排序', description: '学习自定义排序规则', orderIndex: 9, unitId: 'unit-08-sorting' },
  { id: 'lesson-08-10', title: '综合练习', description: '综合运用排序算法', orderIndex: 10, unitId: 'unit-08-sorting' },

  // ===== 单元9: 查找与枚举 =====
  { id: 'lesson-09-01', title: '顺序查找', description: '学习线性查找算法', orderIndex: 1, unitId: 'unit-09-search' },
  { id: 'lesson-09-02', title: '二分查找', description: '学习二分查找算法', orderIndex: 2, unitId: 'unit-09-search' },
  { id: 'lesson-09-03', title: '二分变形', description: '学习二分查找的变形应用', orderIndex: 3, unitId: 'unit-09-search' },
  { id: 'lesson-09-04', title: '枚举思想', description: '理解枚举算法的基本思想', orderIndex: 4, unitId: 'unit-09-search' },
  { id: 'lesson-09-05', title: '简单枚举', description: '用枚举解决简单问题', orderIndex: 5, unitId: 'unit-09-search' },
  { id: 'lesson-09-06', title: '优化枚举', description: '学习枚举的剪枝优化', orderIndex: 6, unitId: 'unit-09-search' },
  { id: 'lesson-09-07', title: '子集枚举', description: '枚举所有子集的方法', orderIndex: 7, unitId: 'unit-09-search' },
  { id: 'lesson-09-08', title: '排列枚举', description: '枚举所有排列的方法', orderIndex: 8, unitId: 'unit-09-search' },
  { id: 'lesson-09-09', title: '组合枚举', description: '枚举所有组合的方法', orderIndex: 9, unitId: 'unit-09-search' },
  { id: 'lesson-09-10', title: '综合练习', description: '综合运用查找和枚举', orderIndex: 10, unitId: 'unit-09-search' },

  // ===== 单元10: NOI入门算法 =====
  { id: 'lesson-10-01', title: '模拟算法', description: '学习按题意模拟的方法', orderIndex: 1, unitId: 'unit-10-advanced' },
  { id: 'lesson-10-02', title: '贪心入门', description: '理解贪心算法的基本思想', orderIndex: 2, unitId: 'unit-10-advanced' },
  { id: 'lesson-10-03', title: '贪心应用', description: '用贪心解决经典问题', orderIndex: 3, unitId: 'unit-10-advanced' },
  { id: 'lesson-10-04', title: '递推入门', description: '学习递推的基本思想', orderIndex: 4, unitId: 'unit-10-advanced' },
  { id: 'lesson-10-05', title: '斐波那契', description: '斐波那契数列及其应用', orderIndex: 5, unitId: 'unit-10-advanced' },
  { id: 'lesson-10-06', title: '动态规划入门', description: '理解动态规划的基本概念', orderIndex: 6, unitId: 'unit-10-advanced' },
  { id: 'lesson-10-07', title: '简单DP', description: '解决简单的动态规划问题', orderIndex: 7, unitId: 'unit-10-advanced' },
  { id: 'lesson-10-08', title: '高精度', description: '学习高精度整数运算', orderIndex: 8, unitId: 'unit-10-advanced' },
  { id: 'lesson-10-09', title: '进制转换', description: '学习不同进制之间的转换', orderIndex: 9, unitId: 'unit-10-advanced' },
  { id: 'lesson-10-10', title: 'NOI综合', description: 'NOI入门级综合练习', orderIndex: 10, unitId: 'unit-10-advanced' },
];

// 导出种子函数
export async function seedUnitsAndLessons() {
  console.log('🎯 创建技能单元...');
  for (const unit of skillUnits) {
    await prisma.skillUnit.upsert({
      where: { id: unit.id },
      update: { ...unit, prerequisiteId: unit.prerequisiteId },
      create: { ...unit, prerequisiteId: unit.prerequisiteId },
    });
  }

  console.log('📖 创建课程...');
  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { id: lesson.id },
      update: lesson,
      create: lesson,
    });
  }

  console.log('✅ 单元和课程创建完成！');
}

// 执行种子函数
seedUnitsAndLessons()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
