# 题目系统

## 概述

题目系统支持6种题型，每种题型有不同的数据结构和判断逻辑。

## 题目类型

### 1. 填空题 (FILL_BLANK)

**数据结构:**
```json
{
  "type": "FILL_BLANK",
  "questionData": {
    "code": "int x = ___BLANK_1___;\ncout << x ___BLANK_2___ 5;",
    "blanks": [
      {
        "id": "BLANK_1",
        "answer": "10",
        "hint": "整数值",
        "alternatives": ["10"]
      },
      {
        "id": "BLANK_2",
        "answer": "+",
        "hint": "运算符",
        "alternatives": ["+"]
      }
    ]
  }
}
```

**用户答案格式:**
```json
{
  "BLANK_1": "10",
  "BLANK_2": "+"
}
```

**判断逻辑:**
```mermaid
flowchart TD
    A[遍历每个blank] --> B{用户答案存在?}
    B -->|否| C[该空错误]
    B -->|是| D[转小写比较]
    D --> E{匹配answer?}
    E -->|是| F[该空正确]
    E -->|否| G{匹配alternatives?}
    G -->|是| F
    G -->|否| C
    F --> H{所有空都正确?}
    C --> H
    H -->|是| I[返回correct=true]
    H -->|否| J[返回correct=false]
```

### 2. 代码排序题 (CODE_ORDER)

**数据结构:**
```json
{
  "type": "CODE_ORDER",
  "questionData": {
    "description": "排列代码实现输出 1-5",
    "lines": [
      { "id": "1", "code": "for (int i = 1; i <= 5; i++) {", "order": 1 },
      { "id": "2", "code": "    cout << i << endl;", "order": 2 },
      { "id": "3", "code": "}", "order": 3 }
    ]
  }
}
```

**用户答案格式:**
```json
["1", "2", "3"]  // 用户排列的行ID顺序
```

**判断逻辑:**
```mermaid
flowchart TD
    A[获取正确顺序] --> B[按order排序lines]
    B --> C[提取正确ID顺序]
    C --> D{JSON.stringify比较}
    D -->|相等| E[返回correct=true]
    D -->|不等| F[返回correct=false]
```

### 3. 选择题 (MULTIPLE_CHOICE)

**数据结构:**
```json
{
  "type": "MULTIPLE_CHOICE",
  "questionData": {
    "question": "int x = 5; cout << x++;  输出什么？",
    "options": [
      { "id": "A", "text": "5", "correct": true },
      { "id": "B", "text": "6", "correct": false },
      { "id": "C", "text": "4", "correct": false },
      { "id": "D", "text": "编译错误", "correct": false }
    ],
    "explanation": "后置递增 x++ 先返回当前值 5，然后 x 变成 6"
  }
}
```

**用户答案格式:**
```json
"A"  // 选项ID
```

**判断逻辑:**
```mermaid
flowchart TD
    A[查找correct=true的选项] --> B{用户答案 === 正确选项ID?}
    B -->|是| C[返回correct=true]
    B -->|否| D[返回correct=false + explanation]
```

### 4. 配对题 (MATCHING)

**数据结构:**
```json
{
  "type": "MATCHING",
  "questionData": {
    "left": [
      { "id": "L1", "text": "声明变量" },
      { "id": "L2", "text": "输出" },
      { "id": "L3", "text": "输入" }
    ],
    "right": [
      { "id": "R1", "text": "int x = 10;" },
      { "id": "R2", "text": "cout << x;" },
      { "id": "R3", "text": "cin >> x;" }
    ],
    "pairs": [["L1", "R1"], ["L2", "R2"], ["L3", "R3"]]
  }
}
```

**用户答案格式:**
```json
[
  ["L1", "R1"],
  ["L2", "R2"],
  ["L3", "R3"]
]
```

**判断逻辑:**
```mermaid
flowchart TD
    A[遍历用户配对] --> B{在正确pairs中找到?}
    B -->|否| C[该配对错误]
    B -->|是| D[该配对正确]
    C --> E{所有配对都正确?}
    D --> E
    E --> F{配对数量相等?}
    F -->|是且全对| G[返回correct=true]
    F -->|否| H[返回correct=false]
```

### 5. 改错题 (BUG_FIX)

**数据结构:**
```json
{
  "type": "BUG_FIX",
  "questionData": {
    "buggyCode": "int sum = 0\nfor (i = 0; i < 5; i++)\n    sum += i;",
    "bugs": [
      { "line": 1, "fix": "int sum = 0;", "hint": "缺少分号" },
      { "line": 2, "fix": "for (int i = 0; i < 5; i++) {", "hint": "缺少类型声明和大括号" }
    ],
    "correctCode": "int sum = 0;\nfor (int i = 0; i < 5; i++) {\n    sum += i;\n}"
  }
}
```

**用户答案格式:**
```json
{
  "1": "int sum = 0;",
  "2": "for (int i = 0; i < 5; i++) {"
}
```

**判断逻辑:**
```mermaid
flowchart TD
    A[遍历每个bug] --> B{用户修复存在?}
    B -->|否| C[该行错误]
    B -->|是| D[trim后比较]
    D --> E{匹配fix?}
    E -->|是| F[该行正确]
    E -->|否| C
    F --> G{所有bug都修复正确?}
    C --> G
    G -->|是| H[返回correct=true]
    G -->|否| I[返回correct=false]
```

### 6. 编程题 (CODING)

**数据结构:**
```json
{
  "type": "CODING",
  "questionData": {
    "testCases": [
      { "input": "5", "output": "120" },
      { "input": "0", "output": "1" }
    ]
  },
  "starterCode": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // 你的代码\n    return 0;\n}"
}
```

**用户答案格式:**
```json
{
  "code": "#include <iostream>\n..."
}
```

**判断逻辑:** (当前为占位符，需要代码执行环境)
```mermaid
flowchart TD
    A[接收代码] --> B[编译代码]
    B --> C{编译成功?}
    C -->|否| D[返回编译错误]
    C -->|是| E[遍历测试用例]
    E --> F[执行代码]
    F --> G{输出匹配?}
    G -->|否| H[记录失败用例]
    G -->|是| I{还有用例?}
    H --> I
    I -->|是| E
    I -->|否| J{全部通过?}
    J -->|是| K[返回correct=true]
    J -->|否| L[返回correct=false]
```

## 前端渲染组件

### QuestionRenderer

根据题目类型渲染不同的答题组件:

```typescript
switch (exercise.type) {
  case 'FILL_BLANK':
    return <FillBlankQuestion ... />;
  case 'CODE_ORDER':
    return <CodeOrderQuestion ... />;
  case 'MULTIPLE_CHOICE':
    return <MultipleChoiceQuestion ... />;
  case 'MATCHING':
    return <MatchingQuestion ... />;
  case 'BUG_FIX':
    return <BugFixQuestion ... />;
  case 'CODING':
    return <CodingQuestion ... />;
}
```

## 相关文件

| 文件 | 说明 |
|------|------|
| `backend/src/routes/questions.ts` | 答案验证逻辑 |
| `backend/prisma/seed.ts` | 题目数据示例 |
| `frontend/src/components/Questions/QuestionRenderer.tsx` | 题目渲染器 |
| `frontend/src/components/Questions/FillBlankQuestion.tsx` | 填空题组件 |
| `frontend/src/components/Questions/CodeOrderQuestion.tsx` | 排序题组件 |
| `frontend/src/components/Questions/MultipleChoiceQuestion.tsx` | 选择题组件 |
| `frontend/src/components/Questions/MatchingQuestion.tsx` | 配对题组件 |
| `frontend/src/components/Questions/BugFixQuestion.tsx` | 改错题组件 |
