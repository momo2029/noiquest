# 数据流

## 整体数据流

```mermaid
flowchart TB
    subgraph 前端
        UI[用户界面]
        State[React State]
        API[API Service]
        Storage[LocalStorage]
    end

    subgraph 后端
        Router[Express Router]
        Middleware[中间件]
        Service[业务逻辑]
        Prisma[Prisma ORM]
    end

    subgraph 外部
        DB[(PostgreSQL)]
        AI[豆包 API]
        Email[邮件服务]
    end

    UI --> State
    State --> API
    API --> Router
    Router --> Middleware
    Middleware --> Service
    Service --> Prisma
    Prisma --> DB
    Service --> AI
    Service --> Email
    Storage --> State
```

## 认证数据流

```mermaid
sequenceDiagram
    participant UI as 前端UI
    participant Auth as AuthContext
    participant API as API Service
    participant LS as LocalStorage
    participant BE as 后端
    participant DB as 数据库

    Note over UI,DB: 登录流程
    UI->>Auth: login(email, password)
    Auth->>API: emailLogin()
    API->>BE: POST /api/email-auth/login
    BE->>DB: 查询用户
    BE->>BE: 验证密码
    BE->>BE: 生成JWT
    BE-->>API: {user, token}
    API->>LS: 保存token
    API-->>Auth: 返回结果
    Auth->>Auth: 更新state
    Auth-->>UI: 登录成功

    Note over UI,DB: 自动登录流程
    UI->>Auth: 组件挂载
    Auth->>LS: 读取token
    LS-->>Auth: token
    Auth->>API: getCurrentUser()
    API->>BE: GET /api/auth/me
    BE->>BE: 验证JWT
    BE->>DB: 查询用户
    BE-->>API: user
    API-->>Auth: user
    Auth->>Auth: 更新state
    Auth-->>UI: 已登录
```

## 答题数据流

```mermaid
sequenceDiagram
    participant UI as 答题界面
    participant LS as LessonSession
    participant API as API Service
    participant BE as 后端
    participant DB as 数据库

    Note over UI,DB: 开始课程
    UI->>LS: 点击开始
    LS->>API: startLesson(lessonId)
    API->>BE: POST /api/skill-tree/lessons/{id}/start
    BE->>DB: 获取课程题目
    BE->>DB: 创建进度记录
    BE-->>API: {exercises}
    API-->>LS: exercises
    LS->>LS: setExercises()
    LS-->>UI: 显示第一题

    Note over UI,DB: 提交答案
    UI->>LS: 提交答案
    LS->>API: submitAnswer(exerciseId, answer)
    API->>BE: POST /api/questions/{id}/answer
    BE->>BE: 验证答案
    alt 正确
        BE->>DB: 更新进度completed=true
        BE->>DB: 增加用户XP
        BE-->>API: {correct: true, xpEarned}
    else 错误
        BE->>DB: 创建错题记录
        BE-->>API: {correct: false, feedback}
    end
    API-->>LS: result
    LS->>LS: 更新state
    LS-->>UI: 显示反馈
```

## AI 数据流

```mermaid
sequenceDiagram
    participant UI as AI界面
    participant API as API Service
    participant BE as 后端
    participant DB as 数据库
    participant AI as 豆包API

    Note over UI,AI: 发送消息
    UI->>API: chat(messages)
    API->>BE: POST /api/ai/chat
    BE->>DB: 检查使用次数
    alt 超出限制
        BE-->>API: 429 错误
        API-->>UI: 显示限制提示
    end
    BE->>DB: 增加使用次数
    BE->>DB: 保存用户消息
    BE->>AI: 调用豆包API
    AI-->>BE: AI回复
    BE->>DB: 保存AI回复
    BE-->>API: {message, usage}
    API-->>UI: 显示回复
```

## 管理员数据流

```mermaid
sequenceDiagram
    participant UI as 管理界面
    participant API as API Service
    participant BE as 后端
    participant MW as 中间件
    participant DB as 数据库

    Note over UI,DB: 获取仪表盘数据
    UI->>API: getAdminDashboard()
    API->>BE: GET /api/admin/dashboard
    BE->>MW: 验证JWT
    MW->>MW: 检查ADMIN角色
    MW-->>BE: 通过
    BE->>DB: 并行查询统计数据
    DB-->>BE: 用户统计
    DB-->>BE: 内容统计
    DB-->>BE: 学习数据
    DB-->>BE: 趋势数据
    BE->>BE: 聚合数据
    BE-->>API: dashboard数据
    API-->>UI: 渲染仪表盘

    Note over UI,DB: 更新用户
    UI->>API: updateAdminUser(userId, data)
    API->>BE: PATCH /api/admin/users/{id}
    BE->>MW: 验证JWT + ADMIN
    MW-->>BE: 通过
    BE->>DB: 更新用户
    DB-->>BE: 更新后的用户
    BE-->>API: user
    API-->>UI: 更新成功
```

## 状态管理

### 前端状态

```typescript
// AuthContext 状态
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// LessonSession 状态
interface LessonState {
  exercises: Exercise[];
  currentIndex: number;
  hearts: number;
  mistakes: number;
  xpEarned: number;
  showFeedback: boolean;
  feedbackData: FeedbackData | null;
  currentQuestionMistakes: number;
  showAIHint: boolean;
}

// AdminDashboard 状态
interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
}
```

### 数据持久化

| 数据 | 存储位置 | 说明 |
|------|----------|------|
| JWT Token | LocalStorage | 认证令牌 |
| 用户设置 | LocalStorage | 主题、语言等 |
| 用户数据 | PostgreSQL | 用户信息、进度 |
| 题目数据 | PostgreSQL | 题目、答案 |
| AI对话 | PostgreSQL | 聊天历史 |

## 缓存策略

```mermaid
flowchart TD
    A[请求数据] --> B{本地有缓存?}
    B -->|是| C{缓存过期?}
    C -->|否| D[返回缓存]
    C -->|是| E[请求后端]
    B -->|否| E
    E --> F[更新缓存]
    F --> G[返回数据]
```

### 缓存配置

| 数据类型 | 缓存时间 | 说明 |
|----------|----------|------|
| 技能树 | 5分钟 | 结构变化少 |
| 用户信息 | 1分钟 | 需要较新数据 |
| 题目内容 | 10分钟 | 基本不变 |
| 统计数据 | 30秒 | 实时性要求高 |
