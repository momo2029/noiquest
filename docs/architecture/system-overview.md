# 系统架构概览

## 整体架构

```mermaid
graph TB
    subgraph 客户端
        Web[Web 浏览器]
    end

    subgraph 前端 [前端 - React]
        App[App.tsx]
        Auth[认证模块]
        SkillTree[技能树模块]
        Admin[管理员模块]
        AI[AI 模块]
    end

    subgraph 后端 [后端 - Express]
        API[API 路由层]
        MW[中间件层]
        SVC[业务逻辑层]
    end

    subgraph 外部服务
        DoubaoAPI[豆包 AI API]
    end

    subgraph 数据层
        PG[(PostgreSQL)]
        Prisma[Prisma ORM]
    end

    Web --> App
    App --> Auth
    App --> SkillTree
    App --> Admin
    App --> AI

    Auth --> API
    SkillTree --> API
    Admin --> API
    AI --> API

    API --> MW
    MW --> SVC
    SVC --> Prisma
    SVC --> DoubaoAPI
    Prisma --> PG
```

## 目录结构

### 前端 (frontend/)

```
frontend/
├── src/
│   ├── App.tsx                 # 主应用入口
│   ├── main.tsx                # React 入口
│   ├── index.css               # 全局样式
│   ├── components/             # 组件
│   │   ├── Admin/              # 管理员组件
│   │   ├── AI/                 # AI 聊天组件
│   │   ├── Auth/               # 认证组件
│   │   ├── Editor/             # 代码编辑器
│   │   ├── Feedback/           # 反馈组件
│   │   ├── Layout/             # 布局组件
│   │   ├── Learning/           # 学习组件
│   │   ├── Questions/          # 题目渲染组件
│   │   ├── Review/             # 复习组件
│   │   ├── SkillTree/          # 技能树组件
│   │   └── Teacher/            # 教师组件
│   ├── contexts/               # React Context
│   ├── services/               # API 服务
│   ├── types/                  # TypeScript 类型
│   └── utils/                  # 工具函数
├── package.json
└── vite.config.ts
```

### 后端 (backend/)

```
backend/
├── src/
│   ├── index.ts                # 应用入口
│   ├── config/                 # 配置
│   │   ├── index.ts            # 配置加载
│   │   └── database.ts         # 数据库连接
│   ├── middleware/             # 中间件
│   │   ├── auth.ts             # 认证中间件
│   │   └── errorHandler.ts     # 错误处理
│   └── routes/                 # API 路由
│       ├── admin.ts            # 管理员 API
│       ├── ai.ts               # AI API
│       ├── auth.ts             # 认证 API
│       ├── class.ts            # 班级 API
│       ├── daily.ts            # 每日目标 API
│       ├── email-auth.ts       # 邮箱认证 API
│       ├── exercise.ts         # 练习 API
│       ├── homework.ts         # 作业 API
│       ├── invite.ts           # 邀请码 API
│       ├── progress.ts         # 进度 API
│       ├── questions.ts        # 题目 API
│       ├── review.ts           # 复习 API
│       ├── skillTree.ts        # 技能树 API
│       ├── stats.ts            # 统计 API
│       └── user.ts             # 用户 API
├── prisma/
│   ├── schema.prisma           # 数据库模型
│   └── seed.ts                 # 种子数据
├── package.json
└── tsconfig.json
```

## 请求流程

```mermaid
sequenceDiagram
    participant C as 客户端
    participant F as 前端
    participant A as API 路由
    participant M as 中间件
    participant S as 业务逻辑
    participant D as 数据库

    C->>F: 用户操作
    F->>A: HTTP 请求 + JWT Token
    A->>M: 路由匹配
    M->>M: 认证验证
    M->>M: 权限检查
    M->>S: 调用业务逻辑
    S->>D: 数据库操作
    D-->>S: 返回数据
    S-->>A: 处理结果
    A-->>F: JSON 响应
    F-->>C: 更新 UI
```

## 环境配置

### 开发环境 (.env.development)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/noi_quest"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV=development
DOUBAO_API_KEY=your-api-key
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_MODEL=ep-xxx
AI_DAILY_LIMIT=100
INVITE_REQUIRED=false
```

### 生产环境 (.env.production)

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="strong-production-secret"
PORT=3001
NODE_ENV=production
DOUBAO_API_KEY=production-api-key
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_MODEL=ep-xxx
AI_DAILY_LIMIT=100
INVITE_REQUIRED=true
```
