# 技能树 V2 设计文档

## 一、概述

基于 NOI 231 个知识点，重构技能树系统，采用 **梯队 → 模块 → 知识点 → 课程 → 题目** 的五级结构。

## 二、数据库改造

### 2.1 新增梯队枚举

```prisma
enum Tier {
  CSP_J      // 入门篇
  CSP_S      // 进阶篇
  PROVINCIAL // 省选/NOI
  IOI        // 大师篇
}
```

### 2.2 新增模块表

```prisma
model Module {
  id          Int         @id
  name        String      // "编程语言基础"
  icon        String      // "📝"
  color       String      // "#22c55e"
  orderIndex  Int         @default(0)

  skillUnits  SkillUnit[]
}
```

### 2.3 修改 SkillUnit 表

```prisma
model SkillUnit {
  // 现有字段保留
  id             String   @id @default(uuid())
  title          String
  description    String
  icon           String   @default("📚")
  color          String   @default("from-blue-400 to-blue-600")
  orderIndex     Int      @default(0)
  requiredXp     Int      @default(0)
  isPublished    Boolean  @default(true)

  // ===== 新增字段 =====
  code           String?  @unique  // 知识点编号 "1-01"
  tier           Tier     @default(CSP_J)
  moduleId       Int?
  coreLevel      Int      @default(3)  // 核心度 1-5

  // 多前置依赖（替代单一 prerequisiteId）
  prerequisiteId String?  // 保留兼容
  prerequisites  SkillUnitPrerequisite[] @relation("UnitPrerequisites")
  dependents     SkillUnitPrerequisite[] @relation("UnitDependents")

  module         Module?  @relation(fields: [moduleId], references: [id])
  // ... 其他关系保持不变
}

// 知识点前置依赖关系表（多对多）
model SkillUnitPrerequisite {
  id             String    @id @default(uuid())
  unitId         String
  prerequisiteId String

  unit           SkillUnit @relation("UnitPrerequisites", fields: [unitId], references: [id], onDelete: Cascade)
  prerequisite   SkillUnit @relation("UnitDependents", fields: [prerequisiteId], references: [id], onDelete: Cascade)

  @@unique([unitId, prerequisiteId])
}
```

### 2.4 新增用户梯队进度表

```prisma
model UserTierProgress {
  id                String   @id @default(uuid())
  userId            String
  tier              Tier
  unlocked          Boolean  @default(false)
  unitsCompleted    Int      @default(0)
  totalUnits        Int      @default(0)
  completionRate    Float    @default(0)  // 0-100
  unlockedAt        DateTime?

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, tier])
}
```

## 三、231 知识点数据

### 3.1 模块定义

| ID | 名称 | 图标 | 颜色 | 知识点数 |
|----|------|------|------|----------|
| 1 | 编程语言基础 | 📝 | #22c55e (绿) | 18 |
| 2 | 数据结构 | 🏗️ | #3b82f6 (蓝) | 39 |
| 3 | 算法基础 | ⚡ | #eab308 (黄) | 49 |
| 4 | 数论与多项式 | 🔢 | #a855f7 (紫) | 44 |
| 5 | 图论 | 🕸️ | #ef4444 (红) | 36 |
| 6 | 字符串与几何 | 📐 | #06b6d4 (青) | 38 |
| 7 | 博弈论 | 🎮 | #f97316 (橙) | 7 |

### 3.2 梯队分布

| 梯队 | 名称 | 知识点数 | 解锁条件 |
|------|------|----------|----------|
| CSP-J | 入门篇 | ~35 | 默认解锁 |
| CSP-S | 进阶篇 | ~70 | 完成 CSP-J 80% |
| 省选/NOI | 高手篇 | ~80 | 完成 CSP-S 80% |
| IOI | 大师篇 | ~46 | 完成省选 80% |

### 3.3 知识点依赖关系（自动推断）

#### 模块1：编程语言基础
```
1-01 变量与类型 (入口)
  ↓
1-02 运算符 ← 1-01
  ↓
1-03 输入输出 ← 1-01
  ↓
1-04 分支结构 ← 1-02
  ↓
1-05 循环结构 ← 1-04
  ↓
1-06 数组 ← 1-05
  ↓
1-07 字符串 ← 1-06
  ↓
1-08 函数 ← 1-05
  ↓
1-09 递归 ← 1-08
  ↓
1-10 结构体 ← 1-06, 1-08
  ↓
1-11 文件操作 ← 1-03
  ↓
1-12 指针与引用 ← 1-06, 1-08
  ↓
1-13 STL vector ← 1-06, 1-12
  ↓
1-14 STL容器 ← 1-13
  ↓
1-15 STL算法 ← 1-14
  ↓
1-16 位运算 ← 1-02
  ↓
1-17 快速读写 ← 1-03
  ↓
1-18 模板 ← 1-08, 1-10
```

#### 模块2：数据结构
```
2-01 模拟栈 ← 1-06
2-02 模拟队列 ← 1-06
2-03 静态链表 ← 1-06
2-04 简单哈希表 ← 1-06
2-05 STL栈 ← 1-14, 2-01
2-06 STL队列 ← 1-14, 2-02
2-07 二叉树 ← 1-09, 1-10
2-08 堆/优先队列 ← 2-07
2-09 并查集基础 ← 1-06, 1-09
2-10 并查集进阶 ← 2-09
2-11 单调栈 ← 2-05
2-12 单调队列 ← 2-06
2-13 字典树 ← 2-07, 1-07
2-14 ST表 ← 1-06, 3-18
...
```

#### 模块3：算法基础
```
3-01 枚举 ← 1-05
3-02 模拟 ← 1-05
3-03 贪心简单 ← 3-01
3-04 递推 ← 1-05
3-05 基础排序 ← 1-06
3-06 快速排序 ← 3-05, 1-09
3-07 归并排序 ← 3-06
3-08 离散化 ← 3-05
3-09 DFS ← 1-09
3-10 BFS ← 2-06
3-11 回溯 ← 3-09
3-12 分治 ← 1-09
3-13 二分答案 ← 1-05
3-14 线性DP ← 3-04
3-15 背包DP ← 3-14
3-16 区间DP ← 3-14
...
```

## 四、前端 UI 设计

### 4.1 整体布局

```
┌──────────────────────────────────────────────────────────────┐
│  [CSP-J 入门] [CSP-S 进阶🔒] [省选🔒] [IOI🔒]  ← 梯队选择器   │
├────────────┬─────────────────────────────────┬───────────────┤
│            │                                 │               │
│  📝 编程基础│     ┌─────┐                    │  今日目标     │
│  ████░ 80% │     │1-01 │ 变量与类型         │  ████░ 60%    │
│            │     └──┬──┘                    │               │
│  🏗️ 数据结构│        │                       │  每日任务     │
│  ██░░░ 40% │     ┌──┴──┐                    │  □ 完成3题    │
│            │     │1-02 │ 运算符             │  ☑ 学习10分钟 │
│  ⚡ 算法   │     └──┬──┘                    │               │
│  ░░░░░ 0%  │        │                       │  推荐学习     │
│            │   ┌────┴────┐                  │  → 1-04 分支  │
│  🔢 数论   │   │         │                  │               │
│  ░░░░░ 0%  │ ┌─┴─┐   ┌───┴───┐              │               │
│            │ │1-03│   │1-04   │              │               │
│  ...       │ └───┘   └───────┘              │               │
│            │                                 │               │
└────────────┴─────────────────────────────────┴───────────────┘
```

### 4.2 知识点节点状态

| 状态 | 样式 | 说明 |
|------|------|------|
| 锁定 | 灰色 + 🔒 | 前置未完成 |
| 可学习 | 彩色边框 + 脉冲动画 | 已解锁，未开始 |
| 进行中 | 彩色填充 + 进度条 | 有部分课程完成 |
| 已完成 | 金色 + ✓ | 所有课程完成 |
| 已精通 | 金色 + 皇冠 | 完美通关所有课程 |

### 4.3 组件结构

```
SkillTreeView (重构)
├── TierSelector          # 梯队选择器
├── ModuleSidebar         # 左侧模块导航
├── KnowledgeMap          # 中间知识点地图
│   ├── KnowledgeNode     # 知识点节点
│   └── DependencyLine    # 依赖连线 (SVG)
└── RightPanel            # 右侧面板
    ├── DailyProgress     # 每日进度
    ├── DailyQuests       # 每日任务
    └── RecommendedNext   # 推荐学习
```

## 五、API 设计

### 5.1 获取技能树 (改造)

```
GET /api/skill-tree?tier=CSP_J&moduleId=1
```

响应：
```json
{
  "tier": {
    "id": "CSP_J",
    "name": "入门篇",
    "unlocked": true,
    "completionRate": 45.5,
    "unitsCompleted": 16,
    "totalUnits": 35
  },
  "modules": [
    {
      "id": 1,
      "name": "编程语言基础",
      "icon": "📝",
      "color": "#22c55e",
      "completedUnits": 8,
      "totalUnits": 10
    }
  ],
  "units": [
    {
      "id": "uuid",
      "code": "1-01",
      "title": "变量与基本数据类型",
      "tier": "CSP_J",
      "moduleId": 1,
      "coreLevel": 5,
      "icon": "📝",
      "unlocked": true,
      "completed": true,
      "lessonsCompleted": 3,
      "totalLessons": 3,
      "crownLevel": 2,
      "prerequisites": [],
      "dependents": ["1-02", "1-03"]
    }
  ],
  "dependencies": [
    { "from": "1-01", "to": "1-02" },
    { "from": "1-01", "to": "1-03" }
  ]
}
```

### 5.2 获取所有梯队状态

```
GET /api/skill-tree/tiers
```

响应：
```json
{
  "tiers": [
    {
      "id": "CSP_J",
      "name": "入门篇",
      "unlocked": true,
      "completionRate": 45.5,
      "color": "#22c55e"
    },
    {
      "id": "CSP_S",
      "name": "进阶篇",
      "unlocked": false,
      "completionRate": 0,
      "unlockRequirement": "完成入门篇 80%",
      "color": "#3b82f6"
    }
  ]
}
```

## 六、开发任务清单

### Phase 1: 数据库改造
- [ ] 1.1 添加 Tier 枚举
- [ ] 1.2 创建 Module 表
- [ ] 1.3 修改 SkillUnit 表（添加 code, tier, moduleId, coreLevel）
- [ ] 1.4 创建 SkillUnitPrerequisite 表
- [ ] 1.5 创建 UserTierProgress 表
- [ ] 1.6 运行数据库迁移

### Phase 2: 种子数据
- [ ] 2.1 创建 7 个模块数据
- [ ] 2.2 创建 231 个知识点数据
- [ ] 2.3 创建知识点依赖关系数据
- [ ] 2.4 清空旧的 SkillUnit 数据

### Phase 3: 后端 API
- [ ] 3.1 修改 GET /api/skill-tree
- [ ] 3.2 新增 GET /api/skill-tree/tiers
- [ ] 3.3 修改解锁逻辑（梯队 80% 解锁）
- [ ] 3.4 更新课程完成逻辑

### Phase 4: 前端组件
- [ ] 4.1 创建 TierSelector 组件
- [ ] 4.2 创建 ModuleSidebar 组件
- [ ] 4.3 创建 KnowledgeNode 组件
- [ ] 4.4 创建 KnowledgeMap 组件（含 SVG 连线）
- [ ] 4.5 重构 SkillTreeView

### Phase 5: 优化
- [ ] 5.1 添加过渡动画
- [ ] 5.2 移动端适配
- [ ] 5.3 性能优化（虚拟滚动）

## 七、数据迁移策略

由于选择 **清空重建**，迁移步骤：

1. 备份现有数据（可选）
2. 清空 SkillUnit、Lesson、UserUnitProgress、UserLessonProgress 表
3. 运行新的 schema 迁移
4. 执行种子脚本导入 231 个知识点
5. 用户进度重置为 0

## 八、风险与注意事项

1. **用户数据丢失**：清空重建会丢失用户学习进度，需提前通知
2. **题目关联**：现有 Exercise 的 unitId/lessonId 会失效，需要重新关联
3. **前端兼容**：需要同时更新前端，否则会报错
