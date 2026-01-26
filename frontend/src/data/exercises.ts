import { Exercise } from '../types';

export const exercises: Exercise[] = [
  {
    id: '1',
    title: 'Hello World',
    description: '编写你的第一个C++程序，在屏幕上输出 "Hello, World!"',
    difficulty: 'easy',
    category: '基础入门',
    xp: 10,
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
    id: '2',
    title: '变量与输入',
    description: '声明一个整数变量，从键盘读取一个数字，然后输出这个数字的两倍',
    difficulty: 'easy',
    category: '基础入门',
    xp: 15,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // 声明变量

    // 读取输入

    // 输出两倍的值

    return 0;
}`,
    hint: '使用 cin >> 变量名; 来读取输入，使用 变量名 * 2 来计算两倍',
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
    id: '3',
    title: '条件判断',
    description: '读取一个整数，判断它是正数、负数还是零，并输出相应的结果',
    difficulty: 'easy',
    category: '条件语句',
    xp: 20,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int num;
    cin >> num;

    // 使用 if-else 判断并输出结果

    return 0;
}`,
    hint: '使用 if (num > 0) 判断正数，else if (num < 0) 判断负数，else 表示零',
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
    id: '4',
    title: '求最大值',
    description: '读取三个整数，找出并输出其中的最大值',
    difficulty: 'easy',
    category: '条件语句',
    xp: 20,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;

    // 找出最大值并输出

    return 0;
}`,
    hint: '可以使用嵌套的 if-else，或者先比较两个数，再用结果和第三个数比较',
    solution: `#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;

    int max = a;
    if (b > max) max = b;
    if (c > max) max = c;

    cout << max << endl;
    return 0;
}`
  },
  {
    id: '5',
    title: '计算1到N的和',
    description: '读取一个正整数N，计算并输出1+2+3+...+N的结果',
    difficulty: 'easy',
    category: '循环语句',
    xp: 25,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // 使用循环计算1到n的和

    return 0;
}`,
    hint: '使用 for 循环从1遍历到n，累加到一个sum变量中',
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
    id: '6',
    title: '九九乘法表',
    description: '使用嵌套循环输出九九乘法表',
    difficulty: 'medium',
    category: '循环语句',
    xp: 35,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // 使用嵌套循环输出九九乘法表

    return 0;
}`,
    hint: '外层循环控制行(1-9)，内层循环控制列(1到当前行数)',
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
    id: '7',
    title: '判断素数',
    description: '读取一个正整数，判断它是否为素数（质数）',
    difficulty: 'medium',
    category: '循环语句',
    xp: 40,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // 判断n是否为素数

    return 0;
}`,
    hint: '素数只能被1和自身整除。可以从2遍历到sqrt(n)，检查是否有因子',
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

    if (isPrime) {
        cout << "是素数" << endl;
    } else {
        cout << "不是素数" << endl;
    }

    return 0;
}`
  },
  {
    id: '8',
    title: '数组求和',
    description: '读取5个整数存入数组，计算并输出它们的和与平均值',
    difficulty: 'medium',
    category: '数组',
    xp: 35,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int arr[5];

    // 读取5个整数

    // 计算和与平均值

    return 0;
}`,
    hint: '使用循环读取数组元素，再用循环累加求和，平均值=和/5',
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
    id: '9',
    title: '冒泡排序',
    description: '读取5个整数，使用冒泡排序将它们从小到大排序后输出',
    difficulty: 'medium',
    category: '数组',
    xp: 45,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int arr[5];

    // 读取5个整数
    for (int i = 0; i < 5; i++) {
        cin >> arr[i];
    }

    // 实现冒泡排序

    // 输出排序后的数组

    return 0;
}`,
    hint: '冒泡排序：相邻元素比较，如果前面的大就交换，重复n-1轮',
    solution: `#include <iostream>
using namespace std;

int main() {
    int arr[5];

    for (int i = 0; i < 5; i++) {
        cin >> arr[i];
    }

    // 冒泡排序
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
    id: '10',
    title: '计算阶乘',
    description: '编写一个函数计算n的阶乘(n!)，读取一个数并输出其阶乘',
    difficulty: 'medium',
    category: '函数',
    xp: 40,
    starterCode: `#include <iostream>
using namespace std;

// 定义计算阶乘的函数
long long factorial(int n) {
    // 实现阶乘计算
}

int main() {
    int n;
    cin >> n;

    cout << factorial(n) << endl;

    return 0;
}`,
    hint: '阶乘: n! = n * (n-1) * (n-2) * ... * 1，可以用循环或递归实现',
    solution: `#include <iostream>
using namespace std;

long long factorial(int n) {
    if (n <= 1) return 1;
    long long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

int main() {
    int n;
    cin >> n;

    cout << factorial(n) << endl;

    return 0;
}`
  },
  {
    id: '11',
    title: '斐波那契数列',
    description: '输出斐波那契数列的前N项（1, 1, 2, 3, 5, 8, 13, ...）',
    difficulty: 'medium',
    category: '函数',
    xp: 40,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // 输出斐波那契数列前n项

    return 0;
}`,
    hint: '斐波那契数列：F(1)=1, F(2)=1, F(n)=F(n-1)+F(n-2)',
    solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    int a = 1, b = 1;
    for (int i = 1; i <= n; i++) {
        if (i <= 2) {
            cout << 1 << " ";
        } else {
            int c = a + b;
            a = b;
            b = c;
            cout << c << " ";
        }
    }
    cout << endl;

    return 0;
}`
  },
  {
    id: '12',
    title: '字符串反转',
    description: '读取一个字符串，将其反转后输出',
    difficulty: 'medium',
    category: '字符串',
    xp: 35,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string str;
    cin >> str;

    // 反转字符串并输出

    return 0;
}`,
    hint: '可以使用双指针法，从两端向中间交换字符',
    solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string str;
    cin >> str;

    int left = 0, right = str.length() - 1;
    while (left < right) {
        char temp = str[left];
        str[left] = str[right];
        str[right] = temp;
        left++;
        right--;
    }

    cout << str << endl;

    return 0;
}`
  },
  {
    id: '13',
    title: '回文判断',
    description: '判断输入的字符串是否为回文（正读反读都一样）',
    difficulty: 'hard',
    category: '字符串',
    xp: 50,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string str;
    cin >> str;

    // 判断是否为回文

    return 0;
}`,
    hint: '比较字符串的第i个字符和第(n-1-i)个字符是否相等',
    solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string str;
    cin >> str;

    bool isPalindrome = true;
    int n = str.length();
    for (int i = 0; i < n / 2; i++) {
        if (str[i] != str[n - 1 - i]) {
            isPalindrome = false;
            break;
        }
    }

    if (isPalindrome) {
        cout << "是回文" << endl;
    } else {
        cout << "不是回文" << endl;
    }

    return 0;
}`
  },
  {
    id: '14',
    title: '二分查找',
    description: '在一个有序数组中使用二分查找法查找目标值',
    difficulty: 'hard',
    category: '算法',
    xp: 60,
    starterCode: `#include <iostream>
using namespace std;

int binarySearch(int arr[], int n, int target) {
    // 实现二分查找，找到返回下标，找不到返回-1
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
    hint: '二分查找：每次比较中间元素，缩小一半的搜索范围',
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
  {
    id: '15',
    title: '递归求和',
    description: '使用递归方法计算1+2+3+...+N',
    difficulty: 'hard',
    category: '递归',
    xp: 55,
    starterCode: `#include <iostream>
using namespace std;

int recursiveSum(int n) {
    // 使用递归计算1到n的和
}

int main() {
    int n;
    cin >> n;

    cout << recursiveSum(n) << endl;

    return 0;
}`,
    hint: '递归思路：sum(n) = n + sum(n-1)，递归终止条件是n=1时返回1',
    solution: `#include <iostream>
using namespace std;

int recursiveSum(int n) {
    if (n == 1) return 1;
    return n + recursiveSum(n - 1);
}

int main() {
    int n;
    cin >> n;

    cout << recursiveSum(n) << endl;

    return 0;
}`
  }
];

export const categories = [
  '全部',
  '基础入门',
  '条件语句',
  '循环语句',
  '数组',
  '函数',
  '字符串',
  '算法',
  '递归'
];

// 学习路径配置
export const learningPath = [
  {
    id: 'unit-1',
    title: '编程启航',
    description: '学习C++基础语法，迈出编程第一步',
    icon: '🚀',
    color: 'from-green-400 to-green-600',
    exercises: ['1', '2'],
    requiredXp: 0
  },
  {
    id: 'unit-2',
    title: '条件判断',
    description: '掌握if-else，让程序学会思考',
    icon: '🤔',
    color: 'from-blue-400 to-blue-600',
    exercises: ['3', '4'],
    requiredXp: 25
  },
  {
    id: 'unit-3',
    title: '循环世界',
    description: '用循环解决重复问题',
    icon: '🔄',
    color: 'from-purple-400 to-purple-600',
    exercises: ['5', '6', '7'],
    requiredXp: 65
  },
  {
    id: 'unit-4',
    title: '数组探索',
    description: '学会用数组管理数据',
    icon: '📊',
    color: 'from-orange-400 to-orange-600',
    exercises: ['8', '9'],
    requiredXp: 165
  },
  {
    id: 'unit-5',
    title: '函数魔法',
    description: '用函数让代码更优雅',
    icon: '✨',
    color: 'from-pink-400 to-pink-600',
    exercises: ['10', '11'],
    requiredXp: 245
  },
  {
    id: 'unit-6',
    title: '字符串处理',
    description: '玩转文字和字符',
    icon: '📝',
    color: 'from-cyan-400 to-cyan-600',
    exercises: ['12', '13'],
    requiredXp: 325
  },
  {
    id: 'unit-7',
    title: '算法入门',
    description: '学习经典算法思想',
    icon: '🧠',
    color: 'from-yellow-400 to-yellow-600',
    exercises: ['14', '15'],
    requiredXp: 410
  }
];

// 成就配置
export const achievements = [
  {
    id: 'first-code',
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
    id: 'streak-3',
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
    id: 'streak-7',
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
    id: 'streak-30',
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
    id: 'complete-5',
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
    id: 'complete-10',
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
    id: 'complete-all',
    key: 'complete-all',
    name: '全部通关',
    description: '完成所有编程题',
    icon: '🏆',
    category: 'COLLECTION',
    condition: { type: 'completeAll', value: 1 },
    reward: { xp: 500, gems: 200 },
    rarity: 'LEGENDARY',
    orderIndex: 7
  },
  {
    id: 'level-5',
    key: 'level-5',
    name: '初级程序员',
    description: '达到5级',
    icon: '💻',
    category: 'MILESTONE',
    condition: { type: 'level', value: 5 },
    reward: { xp: 50, gems: 20 },
    rarity: 'COMMON',
    orderIndex: 8
  },
  {
    id: 'level-10',
    key: 'level-10',
    name: '中级程序员',
    description: '达到10级',
    icon: '🖥️',
    category: 'MILESTONE',
    condition: { type: 'level', value: 10 },
    reward: { xp: 100, gems: 50 },
    rarity: 'RARE',
    orderIndex: 9
  },
  {
    id: 'csp-j-ready',
    key: 'csp-j-ready',
    name: 'CSP-J 预备',
    description: '完成所有基础和中等难度题目',
    icon: '🎖️',
    category: 'COLLECTION',
    condition: { type: 'completeEasyMedium', value: 1 },
    reward: { xp: 200, gems: 100 },
    rarity: 'LEGENDARY',
    orderIndex: 10
  }
];

// 等级经验值配置
export const levelXpRequirements = [
  0,    // Level 1
  50,   // Level 2
  120,  // Level 3
  200,  // Level 4
  300,  // Level 5
  420,  // Level 6
  560,  // Level 7
  720,  // Level 8
  900,  // Level 9
  1100, // Level 10
  1320, // Level 11
  1560, // Level 12
  1820, // Level 13
  2100, // Level 14
  2400, // Level 15
  2720, // Level 16
  3060, // Level 17
  3420, // Level 18
  3800, // Level 19
  4200, // Level 20
];

// 计算等级
export function calculateLevel(totalXp: number): { level: number; currentXp: number; nextLevelXp: number } {
  let level = 1;
  for (let i = 1; i < levelXpRequirements.length; i++) {
    if (totalXp >= levelXpRequirements[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const currentLevelXp = levelXpRequirements[level - 1] || 0;
  const nextLevelXp = levelXpRequirements[level] || levelXpRequirements[levelXpRequirements.length - 1] + 500;

  return {
    level,
    currentXp: totalXp - currentLevelXp,
    nextLevelXp: nextLevelXp - currentLevelXp
  };
}
