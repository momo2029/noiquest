# 知识图谱学习资料功能设计

## 概述

为知识图谱中的每个知识点（SkillUnit）添加学习资料，用户可以通过知识图谱直接学习，而不仅仅是做练习题。

## 实现状态

| 功能 | 状态 |
|------|------|
| 数据库字段扩展 | ✅ 已完成 |
| 后端 API | ✅ 已完成 |
| 前端学习组件 | ✅ 已完成 |
| 静态文件生成 | ✅ 已完成 |
| 管理后台编辑 | ✅ 已完成 |
| AI 内容生成 | ⏳ 待实现 |
| 学习进度追踪 | ⏳ 待实现 |

---

## 数据模型

### SkillUnit 学习资料字段

```prisma
model SkillUnit {
  // ... 现有字段 ...

  // 学习资料字段
  content         String?   @db.Text    // Markdown 格式的学习内容
  codeExamples    Json?                 // 代码示例 [{ title, code, language, explanation }]
  videoUrl        String?               // 视频教程链接
  references      Json?                 // 参考资料 [{ title, url }]
  tips            String[]              // 学习要点/技巧
  commonMistakes  String[]              // 常见错误
  estimatedTime   Int?                  // 预计学习时间（分钟）
}
```

### 前端类型定义

```typescript
interface SkillUnitContent {
  content?: string;           // Markdown 学习内容
  codeExamples?: {
    title: string;
    code: string;
    language: string;
    explanation?: string;
  }[];
  videoUrl?: string;
  references?: {
    title: string;
    url: string;
  }[];
  tips?: string[];
  commonMistakes?: string[];
  estimatedTime?: number;
}
```

---

## API 设计

### 用户端 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/skill-tree/units/:unitId` | GET | 获取知识点详情（含学习资料） |
| `/data/knowledge-graph.json` | GET | 静态文件，知识图谱结构数据 |

### 管理端 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/skill-units` | GET | 获取知识点列表（带内容状态） |
| `/api/admin/skill-units/:unitId/content` | GET | 获取知识点学习资料 |
| `/api/admin/skill-units/:unitId/content` | PUT | 更新知识点学习资料 |
| `/api/admin/regenerate-static` | POST | 重新生成静态文件 |

### 更新学习资料请求体

```json
{
  "content": "## 什么是变量？\n\n变量是程序中用于存储数据的容器...",
  "codeExamples": [
    {
      "title": "变量声明",
      "code": "int age = 18;\ndouble price = 9.99;",
      "language": "cpp",
      "explanation": "声明整型和浮点型变量"
    }
  ],
  "tips": ["变量名要有意义", "遵循命名规范"],
  "commonMistakes": ["未初始化就使用变量"],
  "estimatedTime": 15,
  "videoUrl": "https://example.com/video",
  "references": [
    { "title": "C++ Primer 第2章", "url": "https://..." }
  ]
}
```

---

## 静态文件生成

### 生成机制

- **触发时机**: 管理员更新知识点内容后自动触发
- **输出位置**: `frontend/public/data/knowledge-graph.json`
- **手动触发**: `POST /api/admin/regenerate-static`

### 静态文件结构

```json
{
  "generatedAt": "2026-01-31T10:00:00.000Z",
  "tiers": [
    { "id": "CSP_J", "name": "入门篇", "color": "#22c55e", "totalUnits": 50 }
  ],
  "modules": [
    { "id": 1, "name": "编程语言基础", "icon": "💻", "totalUnits": 20 }
  ],
  "skillTree": [
    {
      "id": "uuid",
      "code": "CSP_J-001",
      "title": "变量与数据类型",
      "tier": "CSP_J",
      "moduleId": 1,
      "hasContent": true,
      "estimatedTime": 15,
      "prerequisites": [],
      "dependents": []
    }
  ],
  "dependencies": [
    { "from": "CSP_J-001", "to": "CSP_J-002" }
  ]
}
```

### 加载策略

```
用户访问知识图谱
    ↓
优先加载静态文件 (knowledge-graph.json)
    ↓
如果是登录用户，异步加载用户进度
    ↓
合并数据显示
```

---

## 前端组件

### 组件结构

```
frontend/src/components/KnowledgeGraph/
├── KnowledgeGraphView.tsx      # 知识图谱主视图
├── GraphVisualization.tsx      # 图谱可视化
├── KnowledgeDetail.tsx         # 知识点详情面板
├── KnowledgeLearningPage.tsx   # 独立学习页面 ✨
├── LearningContent.tsx         # 学习内容渲染组件 ✨
├── StatisticsPanel.tsx         # 统计面板
└── ModuleSidebar.tsx           # 模块侧边栏
```

### KnowledgeDetail.tsx

知识点详情面板，显示：
- 知识点标题、代码、核心度
- 预计学习时间
- 学习要点预览（前3条）
- 前置/后续知识点
- "开始学习"按钮（有学习资料时显示）
- "查看课程"按钮

### KnowledgeLearningPage.tsx

独立学习页面，包含：
- 返回按钮
- 章节导航（内容/代码示例/学习要点/常见错误）
- Markdown 内容渲染
- 代码高亮显示
- 视频嵌入
- 参考资料链接

### LearningContent.tsx

学习内容渲染组件，支持：
- Markdown 渲染（react-markdown）
- 代码语法高亮（react-syntax-highlighter）
- 响应式布局

---

## UI 设计

### 知识点详情面板

```
┌─────────────────────────────────────┐
│ 📚 变量与数据类型                    │
│ CSP_J-001 | 核心度: ⭐⭐⭐⭐⭐        │
├─────────────────────────────────────┤
│ 描述: 学习C++中的基本数据类型...     │
│                                     │
│ ⏱️ 预计学习时间: 15 分钟             │
│                                     │
│ 📝 学习要点:                         │
│ • 整型、浮点型、字符型               │
│ • 变量声明与初始化                   │
│ • 类型转换                          │
│ +2 更多                             │
├─────────────────────────────────────┤
│ [🎯 开始学习]  [📖 查看课程]         │
└─────────────────────────────────────┘
```

### 独立学习页面

```
┌─────────────────────────────────────────────────────────────────┐
│ ← 返回知识图谱         变量与数据类型                            │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 章节导航                                                    │ │
│ │ [内容] [代码示例] [学习要点] [常见错误]                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ## 什么是变量？                                                │
│                                                                 │
│  变量是程序中用于存储数据的容器。你可以把它想象成一个           │
│  带标签的盒子，标签就是变量名，盒子里装的就是数据。             │
│                                                                 │
│  ### 代码示例                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ int age = 18;        // 整型变量                        │   │
│  │ double price = 9.99; // 浮点型变量                      │   │
│  │ char grade = 'A';    // 字符型变量                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💡 **要点**: 变量名要有意义，遵循命名规范                      │
│                                                                 │
│  ⚠️ **常见错误**: 未初始化就使用变量                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    [返回知识图谱]  [去做练习 →]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 相关文件

### 后端

| 文件 | 说明 |
|------|------|
| `backend/prisma/schema.prisma` | SkillUnit 学习资料字段定义 |
| `backend/src/routes/skillTree.ts` | 用户端 API，返回学习资料 |
| `backend/src/routes/admin.ts` | 管理端 API，内容管理 |
| `backend/src/services/staticGenerator.ts` | 静态文件生成服务 |

### 前端

| 文件 | 说明 |
|------|------|
| `frontend/src/components/KnowledgeGraph/KnowledgeLearningPage.tsx` | 独立学习页面 |
| `frontend/src/components/KnowledgeGraph/LearningContent.tsx` | 学习内容渲染 |
| `frontend/src/components/KnowledgeGraph/KnowledgeDetail.tsx` | 知识点详情面板 |
| `frontend/src/components/KnowledgeGraph/KnowledgeGraphView.tsx` | 知识图谱主视图 |
| `frontend/src/services/api.ts` | API 服务，含静态文件加载 |
| `frontend/src/types/index.ts` | SkillUnit 类型定义 |
| `frontend/src/locales/zh-CN.json` | 中文翻译 |
| `frontend/src/locales/en.json` | 英文翻译 |

---

## 与其他模块的关系

### 与 skill-tree.md 的关系

- **skill-tree.md**: 描述用户通过 Course → Session → Exercise 的学习流程
- **本文档**: 描述用户直接在知识图谱学习资料的功能

两者互补：
- 知识图谱学习资料：概念讲解、代码示例、学习要点
- 技能树课程练习：实际做题、巩固知识

### 与 skill-unit-management.md 的关系

- **skill-unit-management.md**: 管理后台的整体设计，包括题目管理、统计分析
- **本文档**: 专注于学习资料功能

本文档中的管理 API 是 skill-unit-management.md 设计的子集实现。

---

## 后续扩展

### 待实现功能

1. **AI 内容生成**
   - 根据知识点信息自动生成学习资料初稿
   - 教师审核修改后发布

2. **学习进度追踪**
   - 记录用户学习状态（未学习/学习中/已学习/已掌握）
   - 知识图谱节点颜色反映学习状态

3. **学习笔记**
   - 用户在学习时添加个人笔记
   - 笔记与知识点关联

4. **互动练习**
   - 在学习内容中嵌入小测验
   - 即时反馈学习效果

5. **学习路径推荐**
   - 根据用户进度推荐下一个学习内容
   - 智能规划学习顺序
