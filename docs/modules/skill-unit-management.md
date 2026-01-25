# 技能单元管理系统设计

## 问题分析

当前技能单元、课程、题目数据在 `seed.ts` 中硬编码，更新需要修改代码并重新部署。需要提供管理界面让管理员直接管理内容。

## 数据库设计

### 新增表

#### KnowledgePoint (知识点)

用于标记题目涉及的知识点，便于按知识点组织复习。

```prisma
model KnowledgePoint {
  id          String   @id @default(uuid())
  name        String   @unique        // 如 "变量声明", "for循环"
  category    String                  // 分类: "语法", "算法", "数据结构"
  orderIndex  Int      @default(0)

  exercises   ExerciseKnowledgePoint[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
}
```

#### ExerciseKnowledgePoint (题目-知识点关联)

```prisma
model ExerciseKnowledgePoint {
  id               String         @id @default(uuid())
  exerciseId       String
  knowledgePointId String

  exercise         Exercise       @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  knowledgePoint   KnowledgePoint @relation(fields: [knowledgePointId], references: [id], onDelete: Cascade)

  @@unique([exerciseId, knowledgePointId])
}
```

### 现有表扩展

#### Exercise 表

```prisma
model Exercise {
  // ... 现有字段 ...

  // 新增
  isPublished     Boolean @default(true)   // 是否发布
  knowledgePoints ExerciseKnowledgePoint[]
}
```

#### SkillUnit 表

```prisma
model SkillUnit {
  // ... 现有字段 ...

  // 新增
  isPublished Boolean @default(true)
}
```

#### Lesson 表

```prisma
model Lesson {
  // ... 现有字段 ...

  // 新增
  isPublished Boolean @default(true)
}
```

## ER 图

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   SkillUnit     │────<│     Lesson      │────<│    Exercise     │
│─────────────────│     │─────────────────│     │─────────────────│
│ id              │     │ id              │     │ id              │
│ title           │     │ title           │     │ title           │
│ description     │     │ orderIndex      │     │ type            │
│ icon            │     │ unitId          │     │ questionData    │
│ orderIndex      │     │ isPublished     │     │ lessonId        │
│ isPublished     │     └─────────────────┘     │ isPublished     │
└─────────────────┘                             └────────┬────────┘
                                                         │
┌─────────────────┐     ┌─────────────────────────┐      │
│ KnowledgePoint  │<────│ ExerciseKnowledgePoint  │<─────┘
│─────────────────│     │─────────────────────────│
│ id              │     │ exerciseId              │
│ name            │     │ knowledgePointId        │
│ category        │     └─────────────────────────┘
│ orderIndex      │
└─────────────────┘
```

## API 设计

### 技能单元

```
GET    /api/admin/skill-units              # 列表
POST   /api/admin/skill-units              # 创建
PUT    /api/admin/skill-units/:id          # 更新
DELETE /api/admin/skill-units/:id          # 删除
PUT    /api/admin/skill-units/reorder      # 排序
```

### 课程

```
GET    /api/admin/lessons                  # 列表
POST   /api/admin/lessons                  # 创建
PUT    /api/admin/lessons/:id              # 更新
DELETE /api/admin/lessons/:id              # 删除
PUT    /api/admin/lessons/reorder          # 排序
```

### 题目

```
GET    /api/admin/exercises                # 列表（支持筛选）
POST   /api/admin/exercises                # 创建
PUT    /api/admin/exercises/:id            # 更新
DELETE /api/admin/exercises/:id            # 删除
```

### 知识点

```
GET    /api/admin/knowledge-points         # 列表
POST   /api/admin/knowledge-points         # 创建
PUT    /api/admin/knowledge-points/:id     # 更新
DELETE /api/admin/knowledge-points/:id     # 删除
```

## 管理后台页面

```
/admin
├── /content                  # 内容管理
│   ├── /skill-units          # 技能单元列表 + 编辑
│   ├── /lessons              # 课程列表 + 编辑
│   ├── /exercises            # 题目列表 + 编辑
│   └── /knowledge-points     # 知识点管理
```

## 题目编辑器

针对不同题型提供表单：

| 题型 | 编辑内容 |
|------|----------|
| FILL_BLANK | 代码文本 + 空位答案列表 |
| CODE_ORDER | 代码行列表 + 正确顺序 |
| MULTIPLE_CHOICE | 题目 + 选项列表 + 正确答案 |
| MATCHING | 左列 + 右列 + 配对关系 |
| BUG_FIX | 错误代码 + 修复列表 |
| CODING | 题目描述 + 初始代码 + 测试用例 |

## 实现步骤

1. 数据库迁移：添加新表和字段
2. 实现管理 API
3. 开发管理后台 UI
