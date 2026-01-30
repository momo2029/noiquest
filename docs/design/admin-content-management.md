# 后台内容管理系统设计文档

## 一、功能概述

后台内容管理系统用于管理学习平台的核心内容。仅管理员可访问。

### 1.1 架构设计：双层分离

系统采用**知识图谱层**与**学习内容层**分离的设计：

```
┌─────────────────────────────────────────────────────────────┐
│  知识图谱层（展示用）                                         │
│  Module → SkillUnit（有依赖关系）                            │
│                                                             │
│  用途：展示知识点地图、依赖关系、学习路径可视化                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ CourseUnit（多对多关联）
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  学习内容层（实际学习）                                       │
│  Module → Course → CourseSession → Exercise                 │
│                                                             │
│  用途：组织学习内容、追踪学习进度                              │
└─────────────────────────────────────────────────────────────┘
```

**设计原则：**
- **SkillUnit** 是知识图谱的节点，用于展示知识点之间的依赖关系
- **Course** 是基于 SkillUnit 设计的学习路径，一个 Course 覆盖一个或多个 SkillUnit
- **CourseSession** 是实际的学习单元，包含具体的练习题
- **Exercise** 只通过 SessionExercise 关联到 CourseSession，不直接关联 SkillUnit

### 1.2 核心概念

| 概念 | 表 | 说明 |
|-----|---|-----|
| 模块 | Module | 顶层分类，如"编程语言基础"、"数据结构"等 |
| 知识单元 | SkillUnit | 知识图谱节点，有前置依赖关系，用于可视化展示 |
| 课程 | Course | 结构化的学习路径，基于 SkillUnit 设计，覆盖一个或多个知识点 |
| 课时 | CourseSession | 课程下的具体学习单元，关联题目 |
| 题目 | Exercise | 练习题，支持多种题型 |

**关系说明：**
- 一个 Module 包含多个 SkillUnit 和多个 Course
- 一个 Course 关联多个 SkillUnit（通过 CourseUnit 表，表示该课程覆盖哪些知识点）
- 一个 Course 包含多个 CourseSession
- 一个 CourseSession 关联多个 Exercise（通过 SessionExercise 表）

### 1.3 功能模块

| 模块 | 功能 |
|------|------|
| 知识单元管理 | 查看、编辑知识单元（知识点由 seed 导入，一般不手动创建） |
| 课程管理 | 创建、编辑、删除课程，管理课时，关联知识单元 |
| 课时管理 | 创建、编辑、删除课时，关联题目 |
| 题目管理 | 创建、编辑、删除题目，支持多题型 |

### 1.4 进度追踪逻辑

```
用户完成 CourseSession
  → 更新 UserSessionProgress
  → 检查 Course 所有 Session 是否完成 → 更新 UserCourseProgress
  → 检查 Course 关联的 SkillUnit（通过 CourseUnit）→ 更新 UserUnitProgress
```

**注意**：UserUnitProgress 的更新是可选的，主要用于知识图谱的可视化展示（显示哪些知识点已掌握）。核心学习进度以 Course/CourseSession 为准。

---

## 二、数据模型

### 2.1 Module（模块）

```prisma
model Module {
  id          Int         @id
  name        String      // "编程语言基础"
  icon        String      @default("📚")
  color       String      @default("#3b82f6")
  orderIndex  Int         @default(0)

  skillUnits  SkillUnit[]
  courses     Course[]
}
```

### 2.2 SkillUnit（知识单元）

```prisma
model SkillUnit {
  id             String   @id @default(uuid())
  title          String
  description    String
  code           String?  @unique  // 知识点编号 "1-01"
  tier           Tier     @default(CSP_J)
  moduleId       Int?
  coreLevel      Int      @default(3)  // 核心度 1-5
  icon           String   @default("📚")
  color          String
  orderIndex     Int      @default(0)
  isPublished    Boolean  @default(true)

  // 依赖关系
  prerequisites  SkillUnitPrerequisite[] @relation("UnitPrerequisites")
  dependentUnits SkillUnitPrerequisite[] @relation("UnitDependents")

  // 关联
  module         Module?     @relation(...)
  courses        CourseUnit[]  // 被哪些课程覆盖
}
```

### 2.3 Course（课程体系）

```prisma
model Course {
  id          String   @id @default(uuid())
  code        String   @unique              // 课程编号 "M1-L01"
  title       String                        // "C++入门与变量"
  description String?
  objectives  String[]                      // 学习目标数组
  orderIndex  Int      @default(0)
  tier        Tier     @default(CSP_J)      // 所属梯队
  moduleId    Int                           // 所属模块
  isPublished Boolean  @default(true)

  // 关联
  module       Module            @relation(...)
  units        CourseUnit[]      // 覆盖的知识单元
  sessions     CourseSession[]   // 包含的课时

  // 课程依赖
  prerequisites     CoursePrerequisite[] @relation("CoursePrerequisites")
  dependentCourses  CoursePrerequisite[] @relation("CourseDependents")
}
```

### 2.4 CourseSession（课时）

```prisma
model CourseSession {
  id          String   @id @default(uuid())
  title       String                        // "算术运算符"
  description String?
  orderIndex  Int      @default(0)
  courseId    String                        // 所属课程
  xpReward    Int      @default(10)
  isPublished Boolean  @default(true)

  course       Course   @relation(...)
  exercises    SessionExercise[]  // 关联的题目
}
```

### 2.5 Exercise（题目）

```prisma
model Exercise {
  id          String       @id @default(uuid())
  title       String
  description String
  difficulty  Difficulty   // EASY | MEDIUM | HARD
  category    String
  type        QuestionType @default(CODING)
  questionData Json?       // 题型特定数据
  starterCode String
  hint        String?
  solution    String?
  xp          Int          @default(10)
  orderIndex  Int          @default(0)
  isPublished Boolean      @default(true)

  // 关联到课时
  sessionExercises SessionExercise[]
}
```

### 2.6 关联表

```prisma
// 课程-知识单元关联
model CourseUnit {
  id        String    @id @default(uuid())
  courseId  String
  unitId    String

  course    Course    @relation(...)
  unit      SkillUnit @relation(...)

  @@unique([courseId, unitId])
}

// 课时-题目关联
model SessionExercise {
  id          String        @id @default(uuid())
  sessionId   String
  exerciseId  String
  orderIndex  Int           @default(0)

  session     CourseSession @relation(...)
  exercise    Exercise      @relation(...)

  @@unique([sessionId, exerciseId])
}
```

### 2.7 用户进度表

```prisma
// 用户课程进度
model UserCourseProgress {
  id                String   @id @default(uuid())
  userId            String
  courseId          String
  unlocked          Boolean  @default(false)
  completed         Boolean  @default(false)
  sessionsCompleted Int      @default(0)
  crownLevel        Int      @default(0)  // 0-3 皇冠等级
  totalXpEarned     Int      @default(0)

  @@unique([userId, courseId])
}

// 用户课时进度
model UserSessionProgress {
  id              String   @id @default(uuid())
  userId          String
  sessionId       String
  completed       Boolean  @default(false)
  mistakes        Int      @default(0)
  perfectRun      Boolean  @default(false)
  completedCount  Int      @default(0)
  xpEarned        Int      @default(0)

  @@unique([userId, sessionId])
}

// 用户知识点进度（用于知识图谱可视化）
model UserUnitProgress {
  id           String   @id @default(uuid())
  userId       String
  unitId       String
  unlocked     Boolean  @default(false)
  completed    Boolean  @default(false)  // 当关联的所有 Course 完成时为 true
  crownLevel   Int      @default(0)

  @@unique([userId, unitId])
}
```

**进度计算逻辑：**
- `UserUnitProgress.completed` = 所有关联该 SkillUnit 的 Course 都已完成
- `UserUnitProgress.unlocked` = 该 SkillUnit 的所有前置依赖都已完成

---

## 三、界面设计

### 3.1 标签页结构

```
内容管理
├── 知识单元 Tab  - 查看/编辑知识点
├── 课程体系 Tab  - 管理课程和课时
├── 题目 Tab      - 管理所有题目
└── 模块 Tab      - 查看模块信息
```

### 3.2 知识单元 Tab

**展示方式：** 卡片列表，按模块分组

**显示信息：**
- 编号、图标、标题、描述
- 所属模块、梯队
- 被多少课程覆盖

```
┌─────────────────────────────────────────────────────────────┐
│ 筛选: [全部模块 ▼] [全部梯队 ▼]                              │
├─────────────────────────────────────────────────────────────┤
│ [1-01] 📝 编程语言基础                                       │
│ C++基础语法                                                  │
│ 学习C++的基本语法和数据类型                                   │
│ CSP-J · 被 2 个课程覆盖                          [编辑]      │
├─────────────────────────────────────────────────────────────┤
│ [1-02] 📝 编程语言基础                                       │
│ 运算符与表达式                                               │
│ ...                                                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 课程体系 Tab

**展示方式：** 卡片列表，可展开查看课时

**显示信息：**
- 课程编号、标题、描述
- 所属模块、梯队
- 课时数、覆盖知识点数
- 发布状态

```
┌─────────────────────────────────────────────────────────────┐
│ 筛选: [全部模块 ▼]                        [+ 新建课程体系]   │
├─────────────────────────────────────────────────────────────┤
│ [▼] M1-L01 C++入门与变量                                     │
│     📝 编程语言基础 · CSP-J                                  │
│     5 课时 · 覆盖 1 个知识点              [已发布] [编辑] [删除] │
├─────────────────────────────────────────────────────────────┤
│     ├── 第一个C++程序 (10 XP)              [已发布] [编辑]   │
│     ├── 变量是什么 (10 XP)                 [已发布] [编辑]   │
│     ├── 整型与字符型 (10 XP)               [已发布] [编辑]   │
│     ├── 浮点型与布尔型 (15 XP)             [已发布] [编辑]   │
│     └── 综合练习 (20 XP)                   [已发布] [编辑]   │
│                                                   [+ 新建课时] │
├─────────────────────────────────────────────────────────────┤
│ [▶] M1-L02 运算符与表达式                                    │
│     📝 编程语言基础 · CSP-J                                  │
│     5 课时 · 覆盖 1 个知识点              [已发布] [编辑] [删除] │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 题目 Tab

**展示方式：** 表格，支持分页和筛选

**筛选：**
- 按课程筛选
- 按课时筛选（联动）
- 按题型筛选

**显示列：**
| 列名 | 说明 |
|------|------|
| 题目 | 标题 |
| 类型 | 编程题/填空题/选择题等 |
| 难度 | 简单/中等/困难 |
| XP | 经验值 |
| 关联课时 | 被哪些课时使用 |
| 操作 | 编辑、删除 |

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 筛选: [全部课程 ▼] [全部课时 ▼] [全部类型 ▼]              [+ 新建题目]       │
├──────────────────────────────────────────────────────────────────────────────┤
│ 题目                          │ 类型   │ 难度   │ XP  │ 关联课时 │ 操作     │
├──────────────────────────────────────────────────────────────────────────────┤
│ Hello World                   │ 编程题 │ 简单   │ 10  │ 2 个课时 │ [编辑][删除] │
│ 声明整型变量                  │ 填空题 │ 简单   │ 10  │ 1 个课时 │ [编辑][删除] │
│ 计算两数之和                  │ 编程题 │ 简单   │ 15  │ 1 个课时 │ [编辑][删除] │
└──────────────────────────────────────────────────────────────────────────────┘
│                              [上一页] 1 / 5 [下一页]                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 四、API 接口

### 4.1 知识单元 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/content/skill-units` | 获取知识单元列表 |
| GET | `/api/admin/content/skill-units/:id` | 获取单个知识单元 |
| PUT | `/api/admin/content/skill-units/:id` | 更新知识单元 |

**注意：** 知识单元由 seed 导入，一般不支持创建和删除。

### 4.2 课程体系 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/content/courses` | 获取课程列表 |
| GET | `/api/admin/content/courses/:id` | 获取课程详情（含课时） |
| POST | `/api/admin/content/courses` | 创建课程 |
| PUT | `/api/admin/content/courses/:id` | 更新课程 |
| DELETE | `/api/admin/content/courses/:id` | 删除课程（有课时时拒绝） |

**创建/更新请求体：**
```typescript
{
  code: string;           // 课程编号，如 "M1-L01"
  title: string;          // 课程标题
  description?: string;   // 描述
  objectives?: string[];  // 学习目标
  tier?: Tier;            // 梯队
  moduleId: number;       // 所属模块
  unitIds?: string[];     // 覆盖的知识单元ID
  isPublished?: boolean;
}
```

### 4.3 课时 API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/content/courses/:courseId/sessions` | 创建课时 |
| PUT | `/api/admin/content/sessions/:id` | 更新课时 |
| DELETE | `/api/admin/content/sessions/:id` | 删除课时 |
| POST | `/api/admin/content/sessions/:id/exercises` | 关联题目到课时 |
| DELETE | `/api/admin/content/sessions/:sessionId/exercises/:exerciseId` | 移除课时的题目关联 |

**创建课时请求体：**
```typescript
{
  title: string;
  description?: string;
  xpReward?: number;      // 默认 10
}
```

### 4.4 题目 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/content/exercises` | 获取题目列表（支持筛选分页） |
| GET | `/api/admin/content/exercises/:id` | 获取题目详情 |
| POST | `/api/admin/content/exercises` | 创建题目 |
| PUT | `/api/admin/content/exercises/:id` | 更新题目 |
| DELETE | `/api/admin/content/exercises/:id` | 删除题目 |

**查询参数：**
```typescript
{
  courseId?: string;      // 按课程筛选
  sessionId?: string;     // 按课时筛选
  type?: QuestionType;    // 按题型筛选
  page?: number;
  limit?: number;
}
```

### 4.5 模块 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/content/modules` | 获取模块列表（用于下拉选择） |

---

## 五、题型设计

### 5.1 题型枚举

| 类型 | 说明 | questionData 结构 |
|------|------|-------------------|
| CODING | 编程题 | 无需额外数据 |
| FILL_BLANK | 代码填空 | `{ code, blanks: [{ id, answer }] }` |
| CODE_ORDER | 代码排序 | `{ lines: [{ id, code, correctOrder }] }` |
| MULTIPLE_CHOICE | 选择题 | `{ options: [{ id, text, isCorrect }], multiple }` |
| MATCHING | 配对题 | `{ pairs: [{ left, right }] }` |
| BUG_FIX | 改错题 | `{ buggyCode, correctCode, bugs: [...] }` |

---

## 六、数据模型清理计划

### 6.1 需要删除的内容

| 类型 | 要删除的 | 原因 |
|------|---------|------|
| 模型 | `Lesson` | 被 CourseSession 替代 |
| 模型 | `UserLessonProgress` | 被 UserSessionProgress 替代 |
| 字段 | `Exercise.lessonId` | Exercise 只通过 SessionExercise 关联 |
| 字段 | `Exercise.unitId` | SkillUnit 不再直接关联 Exercise |
| 字段 | `MistakeRecord.lessonId` | 改用 sessionId 或删除 |
| 字段 | `SkillUnit.prerequisiteId` | 只保留多对多的 SkillUnitPrerequisite |
| 关联 | `SkillUnit.lessons` | 不再需要 |
| 关联 | `SkillUnit.exercises` | 不再需要 |

### 6.2 需要调整的内容

| 内容 | 调整说明 |
|------|---------|
| `UserUnitProgress.lessonsCompleted` | 删除此字段，改为通过关联的 Course 完成数推算 |
| `DailyLearningStats.lessonsCompleted` | 重命名为 `sessionsCompleted` |
| `MistakeRecord.lessonId` | 改为 `sessionId`，关联到 CourseSession（用于定位错题来源）|
| `MistakeRecord.unitId` | 删除，不再直接关联 SkillUnit |
| `MistakeRecord.source` | 保留，值改为 `COURSE` 或 `EXERCISE_LIBRARY` |
| 成就条件 `lessonsCompleted` | 改为 `sessionsCompleted`，检查 UserSessionProgress |
| 成就条件 `perfectLessons` | 改为 `perfectSessions`，检查 UserSessionProgress.perfectRun |

### 6.3 迁移步骤

```sql
-- 步骤 1: 清理 Exercise 的旧关联
UPDATE "Exercise" SET "lessonId" = NULL, "unitId" = NULL;

-- 步骤 2: 清空 Lesson 相关数据
DELETE FROM "UserLessonProgress";
DELETE FROM "Lesson";

-- 步骤 3: 清理 SkillUnit 的旧单一依赖字段
UPDATE "SkillUnit" SET "prerequisiteId" = NULL;

-- 步骤 4: 清理 MistakeRecord 的 lessonId 和 unitId
UPDATE "MistakeRecord" SET "lessonId" = NULL, "unitId" = NULL;

-- 步骤 5: 重命名 DailyLearningStats 字段
ALTER TABLE "DailyLearningStats" RENAME COLUMN "lessonsCompleted" TO "sessionsCompleted";

-- 步骤 6: 删除 UserUnitProgress.lessonsCompleted 字段
ALTER TABLE "UserUnitProgress" DROP COLUMN "lessonsCompleted";
```

### 6.4 Schema 变更

```prisma
// 删除 Lesson 模型
// model Lesson { ... }  -- 删除

// 删除 UserLessonProgress 模型
// model UserLessonProgress { ... }  -- 删除

// 修改 Exercise 模型
model Exercise {
  // 删除以下字段：
  // unitId       String?
  // lessonId     String?
  // unit         SkillUnit?   @relation(...)
  // lesson       Lesson?      @relation(...)

  // 保留 sessionExercises 作为唯一关联方式
  sessionExercises SessionExercise[]
}

// 修改 SkillUnit 模型
model SkillUnit {
  // 删除以下字段：
  // prerequisiteId String?
  // prerequisite   SkillUnit?  @relation("UnitPrerequisite", ...)
  // dependents     SkillUnit[] @relation("UnitPrerequisite")
  // lessons        Lesson[]
  // exercises      Exercise[]

  // 只保留多对多依赖关系
  prerequisites  SkillUnitPrerequisite[] @relation("UnitPrerequisites")
  dependentUnits SkillUnitPrerequisite[] @relation("UnitDependents")

  // 只保留课程关联
  courses        CourseUnit[]
}
```

---

## 七、文件清单

### 7.1 后端文件

| 文件 | 说明 |
|------|------|
| `backend/prisma/schema.prisma` | 数据模型定义 |
| `backend/src/routes/admin-content.ts` | 内容管理 API 路由 |

### 7.2 前端文件

| 文件 | 说明 |
|------|------|
| `frontend/src/components/Admin/ContentManagement.tsx` | 内容管理组件 |
| `frontend/src/services/api.ts` | API 调用服务 |

---

## 八、实现优先级

### 高优先级（Phase 1）
1. 执行数据模型清理（删除 Lesson 相关内容）
2. 课程 CRUD API
3. 课时 CRUD API
4. 课时-题目关联 API
5. 前端课程管理界面

### 中优先级（Phase 2）
1. 知识单元编辑功能
2. 题目筛选（按课程/课时）
3. 删除保护（有课时的课程不能删除）
4. 进度追踪逻辑（CourseSession → Course → SkillUnit）

### 低优先级（Phase 3）
1. 拖拽排序
2. 批量操作
3. 导入导出
