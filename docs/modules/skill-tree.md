# 技能树/学习之旅模块

## 概述

技能树是学生学习的主要入口，采用多邻国风格的闯关设计。包含多个技能单元，每个单元包含多个课程，每个课程包含多道题目。

## 数据结构

### 技能树层级

```
SkillUnit (技能单元)
├── Lesson (课程)
│   ├── Exercise (题目)
│   ├── Exercise
│   └── ...
├── Lesson
│   └── ...
└── ...
```

### 进度追踪

- `UserUnitProgress`: 用户对单元的进度
- `UserLessonProgress`: 用户对课程的进度
- `ExerciseProgress`: 用户对题目的进度

## 流程图

### 技能树加载流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库

    U->>F: 进入技能树页面
    F->>B: GET /api/skill-tree
    B->>D: 查询所有技能单元
    B->>D: 查询用户单元进度
    B->>D: 查询用户课程进度
    B->>B: 计算解锁状态
    B-->>F: 返回技能树数据
    F->>F: 渲染技能树UI
    F-->>U: 显示技能树
```

### 课程学习流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库

    U->>F: 点击开始课程
    F->>B: POST /api/skill-tree/lessons/{id}/start
    B->>D: 获取课程题目
    B->>D: 创建/更新课程进度
    B-->>F: 返回题目列表
    F->>F: 进入答题界面
    F-->>U: 显示第一道题

    loop 每道题目
        U->>F: 提交答案
        F->>B: POST /api/questions/{id}/answer
        B->>B: 验证答案

        alt 答案正确
            B->>D: 更新进度为已完成
            B->>D: 增加用户XP(首次)
            B-->>F: correct: true, xpEarned
            F->>F: 显示正确反馈
            F->>F: 进入下一题
        else 答案错误
            B->>D: 记录错题
            B->>D: 增加课程错误次数
            B-->>F: correct: false, feedback
            F->>F: 显示错误反馈
            F->>F: 扣除生命值
            F->>F: 停留当前题(重试)
        end
    end

    U->>F: 完成所有题目
    F->>B: POST /api/skill-tree/lessons/{id}/complete
    B->>D: 标记课程完成
    B->>D: 计算奖励XP
    B->>D: 检查单元完成状态
    B->>D: 解锁下一单元(如果需要)
    B-->>F: 返回完成结果
    F-->>U: 显示完成界面
```

### 答题判断流程

```mermaid
flowchart TD
    A[提交答案] --> B{题目类型}

    B -->|FILL_BLANK| C[填空题判断]
    C --> C1[遍历每个空]
    C1 --> C2{答案匹配?}
    C2 -->|支持alternatives| C3[检查备选答案]

    B -->|CODE_ORDER| D[排序题判断]
    D --> D1[比较排列顺序]
    D1 --> D2{顺序完全一致?}

    B -->|MULTIPLE_CHOICE| E[选择题判断]
    E --> E1[查找correct:true选项]
    E1 --> E2{用户选择匹配?}

    B -->|MATCHING| F[配对题判断]
    F --> F1[遍历每对配对]
    F1 --> F2{所有配对正确?}

    B -->|BUG_FIX| G[改错题判断]
    G --> G1[逐行比较修复]
    G1 --> G2{所有修复正确?}

    C2 -->|是| H[返回正确]
    C3 -->|匹配| H
    D2 -->|是| H
    E2 -->|是| H
    F2 -->|是| H
    G2 -->|是| H

    C2 -->|否| I[返回错误]
    C3 -->|不匹配| I
    D2 -->|否| I
    E2 -->|否| I
    F2 -->|否| I
    G2 -->|否| I

    H --> J[首次完成给XP]
    I --> K[记录错题]
```

## API 接口

### 获取技能树

```
GET /api/skill-tree
Authorization: Bearer <token>
```

**响应:**
```json
{
  "units": [
    {
      "id": "unit-basics",
      "title": "C++ 基础入门",
      "description": "学习 C++ 的基本语法",
      "icon": "🚀",
      "color": "from-green-400 to-green-600",
      "orderIndex": 1,
      "requiredXp": 0,
      "lessons": [
        {
          "id": "lesson-1",
          "title": "Hello World",
          "orderIndex": 1,
          "exerciseCount": 5
        }
      ],
      "progress": {
        "unlocked": true,
        "completed": false,
        "lessonsCompleted": 1,
        "crownLevel": 0
      }
    }
  ],
  "userStats": {
    "totalXp": 150,
    "level": 2,
    "streak": 5
  }
}
```

### 开始课程

```
POST /api/skill-tree/lessons/{lessonId}/start
Authorization: Bearer <token>
```

**响应:**
```json
{
  "message": "课程开始",
  "exercises": [
    {
      "id": "exercise-1",
      "title": "变量声明",
      "type": "FILL_BLANK",
      "description": "填写正确的代码",
      "questionData": {
        "code": "int x = ___BLANK_1___;",
        "blanks": [
          { "id": "BLANK_1", "hint": "整数值" }
        ]
      },
      "xp": 10
    }
  ]
}
```

### 提交答案

```
POST /api/questions/{exerciseId}/answer
Authorization: Bearer <token>
```

**请求体:**
```json
{
  "answer": {
    "BLANK_1": "10"
  },
  "lessonId": "lesson-1"
}
```

**响应 (正确):**
```json
{
  "correct": true,
  "feedback": "回答正确！",
  "xpEarned": 10,
  "correctAnswer": null
}
```

**响应 (错误):**
```json
{
  "correct": false,
  "feedback": "部分填空不正确，请检查。",
  "xpEarned": 0,
  "correctAnswer": {
    "blanks": [
      { "id": "BLANK_1", "correct": false, "expected": "10" }
    ]
  }
}
```

### 完成课程

```
POST /api/skill-tree/lessons/{lessonId}/complete
Authorization: Bearer <token>
```

**请求体:**
```json
{
  "mistakes": 2
}
```

**响应:**
```json
{
  "message": "课程完成",
  "xpEarned": 50,
  "bonusXp": 10,
  "perfectRun": false,
  "unitCompleted": false,
  "lessonsCompleted": 2,
  "totalLessons": 5,
  "crownLevel": 0
}
```

## 游戏化机制

### XP 奖励规则

| 场景 | XP |
|------|-----|
| 答对题目(首次) | 题目设定的XP值 |
| 答对题目(重复) | 0 |
| 答错题目 | 0 |
| 完美通关(0错误) | 额外20%奖励 |

### 生命值机制

- 初始生命值: 5
- 答错扣除: 1
- 生命值归零: 强制退出课程
- 恢复: 每日自动恢复

### 解锁机制

- 第一个单元默认解锁
- 完成前置单元后解锁下一单元
- 需要达到指定XP才能解锁

## 相关文件

| 文件 | 说明 |
|------|------|
| `backend/src/routes/skillTree.ts` | 技能树API |
| `backend/src/routes/questions.ts` | 题目答案验证 |
| `frontend/src/components/SkillTree/SkillTreeView.tsx` | 技能树视图 |
| `frontend/src/components/SkillTree/LessonSession.tsx` | 课程学习会话 |
| `frontend/src/components/Questions/QuestionRenderer.tsx` | 题目渲染器 |
| `frontend/src/components/Feedback/AnswerFeedback.tsx` | 答题反馈 |
