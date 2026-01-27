# 后台内容管理系统设计文档

## 一、功能概述

后台内容管理系统用于管理学习平台的核心内容，包括技能单元、课程、题目和知识点。仅管理员可访问。

### 1.1 内容层级结构

```
技能单元 (SkillUnit)
    └── 课程 (Lesson)
            └── 题目 (Exercise)
                    └── 知识点 (KnowledgePoint) [多对多]
```

### 1.2 功能模块

| 模块 | 功能 |
|------|------|
| 技能单元管理 | 创建、编辑、删除、排序、发布控制 |
| 课程管理 | 创建、编辑、删除、排序、关联单元 |
| 题目管理 | 创建、编辑、删除、多题型支持、知识点关联 |
| 知识点管理 | 创建、编辑、删除、分类管理 |

### 1.3 排序原则

**整体排序逻辑：从易到难，越难越靠后**

| 层级 | 排序规则 | 说明 |
|------|----------|------|
| 技能单元 | `orderIndex ASC` | 基础单元在前，进阶单元在后 |
| 课程 | `unit.orderIndex ASC` → `orderIndex ASC` | 先按所属单元排序，再按课程自身排序 |
| 题目 | `unit.orderIndex ASC` → `lesson.orderIndex ASC` → `orderIndex ASC` | 三级排序，确保学习路径连贯 |

---

## 二、界面设计

### 2.1 技能单元 Tab

**展示方式：** 卡片列表，可展开查看课程

**排序：** 按 `orderIndex` 升序

**显示信息：**
- 图标、标题、描述
- 课程数、题目数
- 发布状态

**删除规则：** 单元下有课程时不能删除，需先删除或移动课程

```
┌─────────────────────────────────────────────────────────────┐
│ [▼] 📚 C++基础语法                                          │
│     学习C++的基本语法和数据类型                               │
│     3 课程 · 15 题目                              [已发布] [编辑] [删除] │
├─────────────────────────────────────────────────────────────┤
│     ├── 第1课：变量与数据类型                    [已发布]    │
│     ├── 第2课：运算符                           [已发布]    │
│     └── 第3课：输入输出                         [未发布]    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 课程 Tab

**展示方式：** 表格，按技能单元分组，支持分页

**排序：** 先按单元 `orderIndex`，再按课程 `orderIndex`

**筛选：** 可按单元筛选

**分页：** 每页 20 条，显示总数和页码

**显示列：**
| 列名 | 说明 |
|------|------|
| 课程名称 | 课程标题 |
| 所属单元 | 关联的技能单元名称 |
| 题目数 | 该课程下的题目数量 |
| 状态 | 发布/未发布 |
| 操作 | 编辑、删除 |

**删除规则：** 课程下有题目时不能删除，需先删除或移动题目

```
┌──────────────────────────────────────────────────────────────────────┐
│ 筛选: [全部单元 ▼]                              [+ 新建课程]          │
├──────────────────────────────────────────────────────────────────────┤
│ 课程名称              │ 所属单元        │ 题目数 │ 状态   │ 操作     │
├──────────────────────────────────────────────────────────────────────┤
│ 变量与数据类型        │ C++基础语法     │ 5      │ 已发布 │ [编辑][删除] │
│ 运算符                │ C++基础语法     │ 6      │ 已发布 │ [编辑][删除] │
│ 输入输出              │ C++基础语法     │ 4      │ 未发布 │ [编辑][删除] │
├──────────────────────────────────────────────────────────────────────┤
│ 条件语句              │ 流程控制        │ 8      │ 已发布 │ [编辑][删除] │
│ 循环语句              │ 流程控制        │ 10     │ 已发布 │ [编辑][删除] │
└──────────────────────────────────────────────────────────────────────┘
│                              [上一页] 1 / 3 [下一页]                 │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.3 题目 Tab

**展示方式：** 表格，支持分页

**排序：** 单元 → 课程 → 题目（三级排序）

**筛选：**
- 按单元筛选
- 按课程筛选（联动，选择单元后显示该单元下的课程）
- 按题型筛选

**显示列：**
| 列名 | 说明 |
|------|------|
| 题目 | 标题 + 课程名称（副标题） |
| 类型 | 编程题/填空题/选择题等 |
| 难度 | 简单/中等/困难（带颜色标签） |
| XP | 经验值 |
| 操作 | 编辑、删除 |

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 筛选: [全部单元 ▼] [全部课程 ▼] [全部类型 ▼]              [+ 新建题目]       │
├──────────────────────────────────────────────────────────────────────────────┤
│ 题目                          │ 类型   │ 难度   │ XP  │ 操作               │
├──────────────────────────────────────────────────────────────────────────────┤
│ 声明整型变量                  │ 填空题 │ 简单   │ 10  │ [编辑][删除]       │
│ └ 变量与数据类型                                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ 计算两数之和                  │ 编程题 │ 简单   │ 15  │ [编辑][删除]       │
│ └ 运算符                                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ 判断奇偶数                    │ 编程题 │ 中等   │ 20  │ [编辑][删除]       │
│ └ 条件语句                                                                   │
└──────────────────────────────────────────────────────────────────────────────┘
│                              [上一页] 1 / 5 [下一页]                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.4 知识点 Tab

**展示方式：** 表格

**排序：** 按分类 → `orderIndex`

**显示列：**
| 列名 | 说明 |
|------|------|
| 知识点 | 名称 |
| 分类 | 语法/算法/数据结构 |
| 关联题目 | 关联的题目数量 |
| 操作 | 编辑、删除 |

---

## 二、数据模型

### 2.1 技能单元 (SkillUnit)

```prisma
model SkillUnit {
  id             String   @id @default(uuid())
  title          String                           // 标题
  description    String                           // 描述
  icon           String   @default("📚")          // 图标
  color          String   @default("from-blue-400 to-blue-600")  // 渐变色
  orderIndex     Int      @default(0)             // 排序索引
  requiredXp     Int      @default(0)             // 解锁所需XP
  prerequisiteId String?                          // 前置单元ID
  isPublished    Boolean  @default(true)          // 发布状态

  prerequisite   SkillUnit?  @relation("UnitPrerequisite", ...)
  dependents     SkillUnit[] @relation("UnitPrerequisite")
  lessons        Lesson[]
  exercises      Exercise[]
  userProgress   UserUnitProgress[]
}
```

**字段说明：**
- `prerequisiteId`: 前置单元，用于构建技能树的依赖关系
- `requiredXp`: 用户需要达到的XP才能解锁此单元
- `orderIndex`: 用于前端展示排序

### 2.2 课程 (Lesson)

```prisma
model Lesson {
  id           String     @id @default(uuid())
  title        String                           // 标题
  description  String?                          // 描述
  orderIndex   Int        @default(0)           // 排序索引
  unitId       String                           // 所属单元ID
  isPublished  Boolean    @default(true)        // 发布状态

  unit         SkillUnit  @relation(...)
  exercises    Exercise[]
  userProgress UserLessonProgress[]
}
```

**约束：**
- 课程必须关联到一个技能单元
- 删除单元时级联删除课程

### 2.3 题目 (Exercise)

```prisma
model Exercise {
  id          String       @id @default(uuid())
  title       String                             // 标题
  description String                             // 描述
  difficulty  Difficulty                         // 难度: EASY | MEDIUM | HARD
  category    String                             // 分类
  starterCode String                             // 初始代码
  hint        String?                            // 提示
  solution    String?                            // 解答
  xp          Int          @default(10)          // 获得XP
  orderIndex  Int          @default(0)           // 排序索引
  isPublished Boolean      @default(true)        // 发布状态

  type         QuestionType @default(CODING)     // 题型
  questionData Json?                             // 题型特定数据
  source       String       @default("SKILL_TREE")  // 来源
  unitId       String?                           // 所属单元ID
  lessonId     String?                           // 所属课程ID

  unit            SkillUnit?   @relation(...)
  lesson          Lesson?      @relation(...)
  knowledgePoints ExerciseKnowledgePoint[]
  // ... 其他关联
}
```

**题型枚举 (QuestionType)：**

| 值 | 说明 | questionData 结构 |
|----|------|-------------------|
| CODING | 编程题 | 无需额外数据 |
| FILL_BLANK | 代码填空 | `{ blanks: [{ id, answer }] }` |
| CODE_ORDER | 代码排序 | `{ lines: [{ id, code, order }] }` |
| MULTIPLE_CHOICE | 选择题 | `{ options: [{ id, text, isCorrect }], multiple: bool }` |
| MATCHING | 配对题 | `{ pairs: [{ left, right }] }` |
| BUG_FIX | 改错题 | `{ buggyCode, correctCode, bugs: [...] }` |

**来源 (source)：**
- `SKILL_TREE`: 技能树题目，关联到单元和课程
- `EXERCISE_LIBRARY`: 练习题库题目，独立存在

### 2.4 知识点 (KnowledgePoint)

```prisma
model KnowledgePoint {
  id          String   @id @default(uuid())
  name        String   @unique                   // 名称（唯一）
  category    String                             // 分类
  orderIndex  Int      @default(0)               // 排序索引

  exercises   ExerciseKnowledgePoint[]
}

// 多对多关联表
model ExerciseKnowledgePoint {
  id               String         @id @default(uuid())
  exerciseId       String
  knowledgePointId String

  exercise         Exercise       @relation(...)
  knowledgePoint   KnowledgePoint @relation(...)

  @@unique([exerciseId, knowledgePointId])
}
```

### 2.5 数据关系图

```
┌─────────────────┐
│   SkillUnit     │
│  (技能单元)      │
├─────────────────┤
│ id              │
│ title           │
│ prerequisiteId ─┼──┐ (自引用)
│ ...             │  │
└────────┬────────┘  │
         │           │
         │ 1:N       │
         ▼           │
┌─────────────────┐  │
│     Lesson      │  │
│    (课程)       │  │
├─────────────────┤  │
│ id              │  │
│ unitId ─────────┼──┘
│ ...             │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│    Exercise     │       │ KnowledgePoint  │
│    (题目)       │       │   (知识点)       │
├─────────────────┤       ├─────────────────┤
│ id              │  N:M  │ id              │
│ unitId          │◄─────►│ name            │
│ lessonId        │       │ category        │
│ type            │       └─────────────────┘
│ questionData    │
│ ...             │
└─────────────────┘
```

---

## 三、API 接口

### 3.1 技能单元 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/content/skill-units` | 获取所有单元（含课程和题目计数） |
| POST | `/api/admin/content/skill-units` | 创建单元 |
| PUT | `/api/admin/content/skill-units/:id` | 更新单元 |
| DELETE | `/api/admin/content/skill-units/:id` | 删除单元（有课程时拒绝） |
| PUT | `/api/admin/content/skill-units/reorder` | 批量排序 |

**排序规则：** `orderIndex ASC`

**创建/更新请求体：**
```typescript
{
  title: string;
  description: string;
  icon?: string;           // 默认 "📚"
  color?: string;          // 默认 "from-blue-400 to-blue-600"
  requiredXp?: number;     // 默认 0
  prerequisiteId?: string; // 前置单元ID
  isPublished?: boolean;   // 默认 true
}
```

**列表响应：**
```typescript
{
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  orderIndex: number;
  requiredXp: number;
  prerequisiteId: string | null;
  isPublished: boolean;
  lessons: {                    // 包含课程列表（按 orderIndex 排序）
    id: string;
    title: string;
    orderIndex: number;
    isPublished: boolean;
  }[];
  _count: {
    lessons: number;
    exercises: number;
  };
}[]
```

### 3.2 课程 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/content/lessons?unitId=xxx&page=1&limit=20` | 获取课程列表（支持筛选和分页） |
| POST | `/api/admin/content/lessons` | 创建课程 |
| PUT | `/api/admin/content/lessons/:id` | 更新课程 |
| DELETE | `/api/admin/content/lessons/:id` | 删除课程（有题目时拒绝） |
| PUT | `/api/admin/content/lessons/reorder` | 批量排序 |

**排序规则：** `unit.orderIndex ASC` → `orderIndex ASC`

**列表查询参数：**
```typescript
{
  unitId?: string;      // 按单元筛选
  page?: number;        // 页码，默认 1
  limit?: number;       // 每页数量，默认 20
}
```

**创建/更新请求体：**
```typescript
{
  title: string;
  description?: string;
  unitId: string;          // 必填，所属单元
  isPublished?: boolean;
}
```

**列表响应：**
```typescript
{
  lessons: {
    id: string;
    title: string;
    description: string | null;
    orderIndex: number;
    isPublished: boolean;
    unitId: string;
    unit: {
      id: string;
      title: string;
      orderIndex: number;      // 用于前端排序
    };
    _count: {
      exercises: number;
    };
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 3.3 题目 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/content/exercises` | 获取题目列表（支持筛选和分页） |
| GET | `/api/admin/content/exercises/:id` | 获取单个题目详情 |
| POST | `/api/admin/content/exercises` | 创建题目 |
| PUT | `/api/admin/content/exercises/:id` | 更新题目 |
| DELETE | `/api/admin/content/exercises/:id` | 删除题目 |

**排序规则：** `unit.orderIndex ASC` → `lesson.orderIndex ASC` → `orderIndex ASC`

**分页：** 默认每页 20 条

**列表查询参数：**
```typescript
{
  unitId?: string;      // 按单元筛选
  lessonId?: string;    // 按课程筛选（联动：选择单元后可选该单元下的课程）
  type?: QuestionType;  // 按题型筛选
  page?: number;        // 页码，默认 1
  limit?: number;       // 每页数量，默认 20
}
```

**列表响应：**
```typescript
{
  exercises: {
    id: string;
    title: string;
    description: string;
    category: string;
    type: string;
    difficulty: string;
    xp: number;
    orderIndex: number;
    isPublished: boolean;
    unitId: string | null;
    lessonId: string | null;
    unit: {
      id: string;
      title: string;
      orderIndex: number;
    } | null;
    lesson: {
      id: string;
      title: string;          // 显示在题目列表中
      orderIndex: number;
    } | null;
    knowledgePoints: {...}[];
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**创建/更新请求体：**
```typescript
{
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  starterCode?: string;
  hint?: string;
  solution?: string;
  xp?: number;
  type?: QuestionType;
  questionData?: object;
  source?: 'SKILL_TREE' | 'EXERCISE_LIBRARY';
  unitId?: string;
  lessonId?: string;
  isPublished?: boolean;
  knowledgePointIds?: string[];  // 关联的知识点ID列表
}
```

### 3.4 知识点 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/content/knowledge-points?category=xxx` | 获取知识点列表 |
| POST | `/api/admin/content/knowledge-points` | 创建知识点 |
| PUT | `/api/admin/content/knowledge-points/:id` | 更新知识点 |
| DELETE | `/api/admin/content/knowledge-points/:id` | 删除知识点 |

**创建/更新请求体：**
```typescript
{
  name: string;      // 唯一
  category: string;
}
```

---

## 四、前端组件结构

### 4.1 组件层级

```
AdminLayout.tsx                    # 后台主布局
├── 侧边栏导航
│   ├── 仪表盘
│   ├── 内容管理 ←
│   ├── 用户管理
│   ├── 班级管理
│   ├── 数据分析
│   ├── 邀请码管理
│   └── 系统设置
│
└── ContentManagement.tsx          # 内容管理主组件
    ├── 标签页切换
    │   ├── 技能单元 Tab
    │   ├── 课程 Tab
    │   ├── 题目 Tab
    │   └── 知识点 Tab
    │
    ├── 技能单元列表
    │   ├── 单元卡片（可展开查看课程）
    │   ├── 新建单元按钮
    │   └── 单元编辑弹窗
    │
    ├── 课程列表
    │   ├── 单元筛选下拉框
    │   ├── 课程表格
    │   └── 课程编辑弹窗
    │
    ├── 题目列表
    │   ├── 筛选栏（单元、课程、题型）
    │   ├── 题目表格（分页）
    │   └── 题目编辑弹窗
    │
    └── 知识点列表
        ├── 知识点表格
        └── 知识点编辑弹窗
```

### 4.2 状态管理

```typescript
// ContentManagement.tsx 主要状态
const [activeTab, setActiveTab] = useState('units');  // 当前标签页

// 技能单元
const [units, setUnits] = useState([]);
const [editingUnit, setEditingUnit] = useState(null);
const [showUnitModal, setShowUnitModal] = useState(false);

// 课程
const [lessons, setLessons] = useState([]);
const [selectedUnitId, setSelectedUnitId] = useState('');  // 筛选用
const [lessonPage, setLessonPage] = useState(1);           // 课程分页
const [editingLesson, setEditingLesson] = useState(null);
const [showLessonModal, setShowLessonModal] = useState(false);

// 题目
const [exercises, setExercises] = useState([]);
const [exerciseFilters, setExerciseFilters] = useState({
  unitId: '',
  lessonId: '',
  type: '',
});
const [exercisePage, setExercisePage] = useState(1);
const [editingExercise, setEditingExercise] = useState(null);
const [showExerciseModal, setShowExerciseModal] = useState(false);

// 知识点
const [knowledgePoints, setKnowledgePoints] = useState([]);
const [editingKnowledgePoint, setEditingKnowledgePoint] = useState(null);
const [showKnowledgePointModal, setShowKnowledgePointModal] = useState(false);
```

### 4.3 API 调用层

```typescript
// frontend/src/services/api.ts

// 技能单元
api.getContentSkillUnits()
api.createContentSkillUnit(data)
api.updateContentSkillUnit(id, data)
api.deleteContentSkillUnit(id)  // 有课程时返回错误
api.reorderContentSkillUnits(orders)

// 课程
api.getContentLessons(params)  // params: { unitId?, page?, limit? }
api.createContentLesson(data)
api.updateContentLesson(id, data)
api.deleteContentLesson(id)    // 有题目时返回错误

// 题目
api.getContentExercises(params)
api.getContentExercise(id)
api.createContentExercise(data)
api.updateContentExercise(id, data)
api.deleteContentExercise(id)

// 知识点
api.getContentKnowledgePoints(category?)
api.createContentKnowledgePoint(data)
api.updateContentKnowledgePoint(id, data)
api.deleteContentKnowledgePoint(id)
```

---

## 五、权限控制

### 5.1 后端中间件

```typescript
// 所有内容管理接口都需要
router.use(authenticate);           // 验证登录
router.use(requireRole('ADMIN'));   // 验证管理员角色
```

### 5.2 前端路由保护

```typescript
// AdminLayout.tsx
if (user?.role !== 'ADMIN') {
  return <Navigate to="/" />;
}
```

---

## 六、题型详细设计

### 6.1 编程题 (CODING)

**用途：** 用户编写完整代码解决问题

**数据结构：**
```typescript
{
  type: 'CODING',
  starterCode: string,    // 初始代码模板
  solution: string,       // 参考答案
  hint: string,           // 提示
  // questionData 不需要
}
```

### 6.2 代码填空 (FILL_BLANK)

**用途：** 代码中有空白处，用户填写缺失部分

**数据结构：**
```typescript
{
  type: 'FILL_BLANK',
  questionData: {
    code: string,         // 带空白标记的代码，如 "int x = ___;"
    blanks: [
      { id: string, answer: string, hint?: string }
    ]
  }
}
```

### 6.3 代码排序 (CODE_ORDER)

**用途：** 给出打乱的代码行，用户排列正确顺序

**数据结构：**
```typescript
{
  type: 'CODE_ORDER',
  questionData: {
    lines: [
      { id: string, code: string, correctOrder: number }
    ]
  }
}
```

### 6.4 选择题 (MULTIPLE_CHOICE)

**用途：** 单选或多选题

**数据结构：**
```typescript
{
  type: 'MULTIPLE_CHOICE',
  questionData: {
    multiple: boolean,    // 是否多选
    options: [
      { id: string, text: string, isCorrect: boolean }
    ]
  }
}
```

### 6.5 配对题 (MATCHING)

**用途：** 左右两列内容配对

**数据结构：**
```typescript
{
  type: 'MATCHING',
  questionData: {
    pairs: [
      { id: string, left: string, right: string }
    ]
  }
}
```

### 6.6 改错题 (BUG_FIX)

**用途：** 找出并修复代码中的错误

**数据结构：**
```typescript
{
  type: 'BUG_FIX',
  questionData: {
    buggyCode: string,      // 有错误的代码
    correctCode: string,    // 正确的代码
    bugs: [
      { line: number, description: string, fix: string }
    ]
  }
}
```

---

## 七、文件清单

### 7.1 后端文件

| 文件 | 说明 |
|------|------|
| `backend/prisma/schema.prisma` | 数据模型定义 |
| `backend/src/routes/admin-content.ts` | 内容管理 API 路由 |
| `backend/src/routes/admin.ts` | 通用管理 API 路由 |

### 7.2 前端文件

| 文件 | 说明 |
|------|------|
| `frontend/src/components/Admin/AdminLayout.tsx` | 后台主布局 |
| `frontend/src/components/Admin/ContentManagement.tsx` | 内容管理组件 |
| `frontend/src/services/api.ts` | API 调用服务 |

---

## 八、待优化项

### 8.1 功能增强

1. **批量操作**
   - 批量删除题目
   - 批量修改发布状态
   - 批量移动题目到其他课程

2. **导入导出**
   - 题目批量导入（JSON/Excel）
   - 题目批量导出
   - 单元/课程整体导出

3. **预览功能**
   - 题目预览（模拟学生视角）
   - 课程预览

4. **版本控制**
   - 题目修改历史
   - 回滚功能

### 8.2 用户体验

1. **拖拽排序**
   - 单元拖拽排序
   - 课程拖拽排序
   - 题目拖拽排序

2. **搜索功能**
   - 题目全文搜索
   - 知识点搜索

3. **富文本编辑**
   - 题目描述支持 Markdown
   - 代码高亮编辑器

### 8.3 数据校验

1. **删除保护（必须实现）**
   - 技能单元下有课程时，不能删除单元
   - 课程下有题目时，不能删除课程
   - 知识点有关联题目时，提示但允许删除（会解除关联）

2. **数据完整性**
   - 题目必填字段校验
   - questionData 格式校验

---

## 九、删除保护交互设计

### 9.1 交互方案

**方案：点击后提示（推荐）**

删除按钮始终可点击，点击后：
- 如果有子项，显示错误 toast 提示，说明无法删除的原因
- 如果没有子项，显示确认弹窗，确认后执行删除

**选择理由：**
- 实现简单，不需要额外查询子项数量
- 用户体验一致，所有删除操作流程相同
- 错误信息由后端返回，前后端逻辑统一

### 9.2 删除流程

```
用户点击删除按钮
       │
       ▼
  显示确认弹窗
  "确定要删除 XXX 吗？"
       │
       ▼
  用户点击确认
       │
       ▼
  调用删除 API
       │
       ├─── 成功 ───► 显示成功 toast + 刷新列表
       │
       └─── 失败 ───► 显示错误 toast（包含子项数量）
```

### 9.3 错误提示格式

| 场景 | 错误提示 |
|------|----------|
| 删除技能单元（有课程） | "该单元下有 3 个课程，请先删除课程" |
| 删除课程（有题目） | "该课程下有 5 道题目，请先删除题目" |

### 9.4 前端实现

```tsx
// 删除确认弹窗
const [deleteConfirm, setDeleteConfirm] = useState<{
  show: boolean;
  type: 'unit' | 'lesson' | 'exercise' | 'knowledgePoint';
  id: string;
  title: string;
} | null>(null);

// 点击删除按钮
const handleDeleteClick = (type: string, id: string, title: string) => {
  setDeleteConfirm({ show: true, type, id, title });
};

// 确认删除
const handleDeleteConfirm = async () => {
  if (!deleteConfirm) return;

  try {
    switch (deleteConfirm.type) {
      case 'unit':
        await api.deleteContentSkillUnit(deleteConfirm.id);
        break;
      case 'lesson':
        await api.deleteContentLesson(deleteConfirm.id);
        break;
      // ...
    }
    toast.success('删除成功');
    // 刷新列表
  } catch (error: any) {
    // 后端返回的错误信息，如 "该单元下有 3 个课程，请先删除课程"
    toast.error(error.response?.data?.message || '删除失败');
  } finally {
    setDeleteConfirm(null);
  }
};

// 确认弹窗组件
{deleteConfirm && (
  <ConfirmDialog
    title="确认删除"
    message={`确定要删除「${deleteConfirm.title}」吗？此操作不可恢复。`}
    onConfirm={handleDeleteConfirm}
    onCancel={() => setDeleteConfirm(null)}
    confirmText="删除"
    confirmVariant="danger"
  />
)}
```

### 9.5 后端错误响应

```typescript
// 错误响应格式
{
  "success": false,
  "message": "该单元下有 3 个课程，请先删除课程",
  "code": "DELETE_BLOCKED"
}

// HTTP 状态码: 400 Bad Request
```

---

## 十、当前实现与设计差异

以下是当前代码实现与本设计文档的差异，需要后续修改：

### 10.1 后端 API 修改

| 接口 | 当前实现 | 设计要求 | 状态 |
|------|----------|----------|------|
| GET /lessons | 不支持分页 | 支持分页，返回 pagination 对象 | 待修改 |
| GET /lessons | 按 `unitId` + `orderIndex` 排序 | 需要返回 `unit.orderIndex` 供前端排序 | 待修改 |
| GET /exercises | 只按 `orderIndex` 排序 | 按 `unit.orderIndex` → `lesson.orderIndex` → `orderIndex` 排序 | 待修改 |
| DELETE /skill-units/:id | 直接删除 | 检查是否有课程，有则拒绝删除 | 待修改 |
| DELETE /lessons/:id | 直接删除 | 检查是否有题目，有则拒绝删除 | 待修改 |

**删除保护实现：**

```typescript
// admin-content.ts - 删除技能单元
router.delete('/skill-units/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查是否有课程
    const lessonCount = await prisma.lesson.count({ where: { unitId: id } });
    if (lessonCount > 0) {
      throw new AppError(`该单元下有 ${lessonCount} 个课程，请先删除课程`, 400);
    }

    await prisma.skillUnit.delete({ where: { id } });
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

// admin-content.ts - 删除课程
router.delete('/lessons/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查是否有题目
    const exerciseCount = await prisma.exercise.count({ where: { lessonId: id } });
    if (exerciseCount > 0) {
      throw new AppError(`该课程下有 ${exerciseCount} 道题目，请先删除题目`, 400);
    }

    await prisma.lesson.delete({ where: { id } });
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});
```

**具体修改：**

```typescript
// admin-content.ts - 课程列表（支持分页）
const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 20;
const skip = (page - 1) * limit;

const [lessons, total] = await Promise.all([
  prisma.lesson.findMany({
    where: unitId ? { unitId } : undefined,
    orderBy: [{ unit: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
    skip,
    take: limit,
    include: {
      unit: { select: { id: true, title: true, orderIndex: true } },
      _count: { select: { exercises: true } }
    }
  }),
  prisma.lesson.count({ where: unitId ? { unitId } : undefined })
]);

res.json({
  lessons,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }
});

// admin-content.ts - 题目列表
const exercises = await prisma.exercise.findMany({
  where,
  orderBy: [
    { unit: { orderIndex: 'asc' } },      // 添加
    { lesson: { orderIndex: 'asc' } },    // 添加
    { orderIndex: 'asc' }
  ],
  // ...
});
```

### 10.2 前端组件修改

| 组件 | 当前实现 | 设计要求 | 状态 |
|------|----------|----------|------|
| 课程 Tab | 无分页 | 支持分页，每页 20 条 | 待修改 |
| 课程 Tab | 简单表格 | 按单元分组显示 | 待修改 |
| 题目 Tab | 显示单元名称 | 显示课程名称 | 待修改 |
| 题目筛选 | 单元和课程独立筛选 | 课程筛选联动单元 | 待修改 |

**具体修改：**

```tsx
// ContentManagement.tsx - 题目列表显示课程名称
<td className="px-4 py-3">
  <p className="text-white font-medium">{exercise.title}</p>
  {exercise.lesson && (
    <p className="text-white/50 text-xs">{exercise.lesson.title}</p>  // 改为显示课程
  )}
</td>

// ContentManagement.tsx - 课程筛选联动
// 当选择单元时，课程下拉框只显示该单元下的课程
const filteredLessonsForSelect = filterUnitId
  ? lessons.filter(l => l.unitId === filterUnitId)
  : lessons;
```

### 10.3 修改优先级

1. **高优先级**
   - 删除保护：技能单元有课程时不能删除
   - 删除保护：课程有题目时不能删除
   - 课程列表分页
   - 题目列表显示课程名称（用户体验）
   - 题目三级排序（数据展示正确性）

2. **中优先级**
   - 课程筛选联动单元
   - 课程按单元分组显示

3. **低优先级**
   - 其他待优化项
