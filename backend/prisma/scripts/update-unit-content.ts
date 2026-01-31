/**
 * 更新知识点学习资料脚本
 * 用法: npx ts-node prisma/scripts/update-unit-content.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 第一个知识点的学习资料
const unit1Content = {
  code: '1-01',
  content: `## 什么是变量？

变量是程序中用于存储数据的容器。你可以把它想象成一个带标签的盒子，标签就是变量名，盒子里装的就是数据。

在 C++ 中，每个变量都有一个**类型**，类型决定了变量可以存储什么样的数据，以及占用多少内存空间。

## 基本数据类型

C++ 提供了以下几种基本数据类型：

### 1. 整数类型

| 类型 | 大小 | 范围 |
|------|------|------|
| \`int\` | 4 字节 | -2,147,483,648 ~ 2,147,483,647 |
| \`long long\` | 8 字节 | -9,223,372,036,854,775,808 ~ 9,223,372,036,854,775,807 |
| \`short\` | 2 字节 | -32,768 ~ 32,767 |
| \`unsigned int\` | 4 字节 | 0 ~ 4,294,967,295 |

> 💡 **竞赛提示**：在 NOI 竞赛中，当数据范围超过 21 亿时，要使用 \`long long\` 类型！

### 2. 浮点类型

| 类型 | 大小 | 精度 |
|------|------|------|
| \`float\` | 4 字节 | 约 6-7 位有效数字 |
| \`double\` | 8 字节 | 约 15-16 位有效数字 |

> 💡 **竞赛提示**：一般使用 \`double\`，精度更高。

### 3. 字符类型

\`char\` 类型用于存储单个字符，占用 1 字节。

\`\`\`cpp
char grade = 'A';
char newline = '\\n';
\`\`\`

### 4. 布尔类型

\`bool\` 类型只有两个值：\`true\`（真）和 \`false\`（假）。

\`\`\`cpp
bool isStudent = true;
bool hasFinished = false;
\`\`\`

## 变量的声明与初始化

### 声明变量

\`\`\`cpp
int age;           // 声明一个整型变量
double price;      // 声明一个双精度浮点变量
char letter;       // 声明一个字符变量
\`\`\`

### 初始化变量

\`\`\`cpp
int age = 18;              // 声明并初始化
double price = 9.99;
char letter = 'A';

// 也可以先声明后赋值
int count;
count = 10;
\`\`\`

## 类型转换

### 隐式转换（自动转换）

当不同类型的数据进行运算时，C++ 会自动将较小的类型转换为较大的类型：

\`\`\`cpp
int a = 5;
double b = 2.5;
double c = a + b;  // a 自动转换为 double，c = 7.5
\`\`\`

### 显式转换（强制转换）

\`\`\`cpp
double pi = 3.14159;
int n = (int)pi;           // C 风格转换，n = 3
int m = static_cast<int>(pi);  // C++ 风格转换，m = 3
\`\`\`

## 变量命名规则

1. 只能包含字母、数字和下划线
2. 必须以字母或下划线开头
3. 区分大小写（\`age\` 和 \`Age\` 是不同的变量）
4. 不能使用 C++ 关键字（如 \`int\`、\`for\`、\`while\` 等）

### 命名建议

- 使用有意义的名称：\`studentCount\` 比 \`sc\` 更好
- 使用驼峰命名法：\`maxValue\`、\`totalSum\`
- 常量使用全大写：\`MAX_SIZE\`、\`PI\`
`,

  codeExamples: [
    {
      title: '变量声明与初始化',
      code: `#include <iostream>
using namespace std;

int main() {
    // 整型变量
    int age = 18;
    long long bigNumber = 1234567890123LL;

    // 浮点型变量
    double price = 9.99;
    double pi = 3.14159265358979;

    // 字符型变量
    char grade = 'A';

    // 布尔型变量
    bool isStudent = true;

    // 输出变量值
    cout << "年龄: " << age << endl;
    cout << "大数: " << bigNumber << endl;
    cout << "价格: " << price << endl;
    cout << "等级: " << grade << endl;
    cout << "是学生: " << isStudent << endl;

    return 0;
}`,
      language: 'cpp',
      explanation: '演示了 C++ 中各种基本数据类型的声明和初始化方式。注意 long long 类型的字面量需要加 LL 后缀。'
    },
    {
      title: '类型转换示例',
      code: `#include <iostream>
using namespace std;

int main() {
    // 隐式转换
    int a = 5;
    double b = 2.5;
    double sum = a + b;  // a 自动转换为 double
    cout << "5 + 2.5 = " << sum << endl;

    // 显式转换（强制转换）
    double pi = 3.14159;
    int n = (int)pi;     // 截断小数部分
    cout << "pi 转换为整数: " << n << endl;

    // 整数除法 vs 浮点除法
    int x = 7, y = 2;
    cout << "7 / 2 (整数除法) = " << x / y << endl;
    cout << "7 / 2 (浮点除法) = " << (double)x / y << endl;

    return 0;
}`,
      language: 'cpp',
      explanation: '展示了隐式类型转换和显式类型转换的区别。特别注意整数除法和浮点除法的结果不同！'
    },
    {
      title: '数据范围与溢出',
      code: `#include <iostream>
using namespace std;

int main() {
    // int 的最大值
    int maxInt = 2147483647;
    cout << "int 最大值: " << maxInt << endl;

    // 溢出演示（危险！）
    int overflow = maxInt + 1;
    cout << "溢出后: " << overflow << endl;  // 变成负数！

    // 使用 long long 避免溢出
    long long bigSum = (long long)maxInt + 1;
    cout << "使用 long long: " << bigSum << endl;

    // 竞赛中常见的大数计算
    long long n = 100000;
    long long result = n * n;  // 10^10，超过 int 范围
    cout << "100000 * 100000 = " << result << endl;

    return 0;
}`,
      language: 'cpp',
      explanation: '演示了整数溢出的问题。在竞赛中，当数据可能超过 21 亿时，一定要使用 long long！'
    }
  ],

  tips: [
    '当数据范围超过 21 亿（2×10⁹）时，使用 long long 而不是 int',
    '浮点数比较不要用 ==，应该判断差值是否小于一个很小的数（如 1e-9）',
    '变量使用前一定要初始化，未初始化的变量值是不确定的',
    '使用有意义的变量名，提高代码可读性',
    'long long 类型的字面量要加 LL 后缀，如 1000000000000LL'
  ],

  commonMistakes: [
    '忘记初始化变量，导致使用了垃圾值',
    '整数溢出：两个 int 相乘结果超出 int 范围',
    '整数除法丢失精度：5/2 结果是 2 而不是 2.5',
    '混淆 = 和 ==：= 是赋值，== 是比较',
    '字符和字符串混淆：\'A\' 是字符，"A" 是字符串'
  ],

  estimatedTime: 20,

  references: [
    { title: 'C++ 数据类型 - 菜鸟教程', url: 'https://www.runoob.com/cplusplus/cpp-data-types.html' },
    { title: 'C++ 变量类型 - cppreference', url: 'https://zh.cppreference.com/w/cpp/language/types' }
  ]
};

async function updateUnitContent() {
  console.log('开始更新知识点学习资料...');

  // 查找知识点
  const unit = await prisma.skillUnit.findFirst({
    where: { code: unit1Content.code }
  });

  if (!unit) {
    console.error(`找不到知识点: ${unit1Content.code}`);
    return;
  }

  console.log(`找到知识点: ${unit.title} (${unit.code})`);

  // 更新学习资料
  const updated = await prisma.skillUnit.update({
    where: { id: unit.id },
    data: {
      content: unit1Content.content,
      codeExamples: unit1Content.codeExamples,
      tips: unit1Content.tips,
      commonMistakes: unit1Content.commonMistakes,
      estimatedTime: unit1Content.estimatedTime,
      references: unit1Content.references,
    }
  });

  console.log(`✅ 已更新知识点: ${updated.title}`);
  console.log(`   - 内容长度: ${updated.content?.length || 0} 字符`);
  console.log(`   - 代码示例: ${(updated.codeExamples as any[])?.length || 0} 个`);
  console.log(`   - 学习要点: ${updated.tips?.length || 0} 条`);
  console.log(`   - 常见错误: ${updated.commonMistakes?.length || 0} 条`);
  console.log(`   - 预计时间: ${updated.estimatedTime} 分钟`);
}

updateUnitContent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
