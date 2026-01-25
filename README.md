# NOI Quest - C++ 学习平台

一个面向初中生的 C++ 编程学习平台，采用游戏化设计，帮助学生备战 CSP-J、CSP-S 和 NOI 竞赛。

## 功能特性

### 学生端
- **技能树学习** - 多邻国风格的学习路径，循序渐进掌握 C++ 知识
- **多种题型** - 编程题、填空题、排序题、选择题、配对题、改错题
- **游戏化机制** - 经验值、等级、连续学习天数、生命值、宝石奖励
- **每日目标** - 设定每日学习目标，培养学习习惯
- **错题本** - 自动记录错题，支持复习巩固
- **AI 助教** - 智能问答，帮助理解代码和解决问题

### 教师端
- **学生管理** - 查看学生学习进度和数据
- **作业管理** - 布置和批改作业
- **数据分析** - 班级学习情况统计

### 管理员端
- **用户管理** - 管理平台用户
- **内容管理** - 管理题目和课程内容
- **数据分析** - 平台整体数据统计

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT 认证

### 前端
- React 18
- TypeScript
- Vite
- TailwindCSS
- Lucide Icons

### 部署
- Docker + Docker Compose
- Nginx 反向代理

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 14+
- pnpm / npm / yarn

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd noiquest
```

2. 安装依赖
```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

3. 配置环境变量

后端 (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/noiquest"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
DOUBAO_API_KEY="your-doubao-api-key"
EMAIL_HOST="smtp.qq.com"
EMAIL_PORT=587
EMAIL_USER="your-email"
EMAIL_PASS="your-email-password"
```

4. 初始化数据库
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. 启动开发服务器
```bash
# 后端 (端口 3001)
cd backend
npm run dev

# 前端 (端口 5173)
cd frontend
npm run dev
```

6. 访问应用
- 前端: http://localhost:5173
- 后端 API: http://localhost:3001

## Docker 部署

```bash
cd deploy
docker-compose up -d
```

## 项目结构

```
noiquest/
├── backend/                 # 后端代码
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── middleware/     # 中间件
│   │   └── routes/         # API 路由
│   └── prisma/             # 数据库模型
├── frontend/               # 前端代码
│   └── src/
│       ├── components/     # React 组件
│       ├── contexts/       # React Context
│       ├── hooks/          # 自定义 Hooks
│       ├── services/       # API 服务
│       └── types/          # TypeScript 类型
└── deploy/                 # 部署配置
    ├── docker-compose.yml
    └── nginx.conf
```

## API 文档

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 技能树
- `GET /api/skill-tree` - 获取技能树
- `GET /api/skill-tree/lesson/:id` - 获取课程详情
- `POST /api/skill-tree/lesson/:id/start` - 开始课程
- `POST /api/skill-tree/lesson/:id/complete` - 完成课程

### 题目
- `GET /api/questions/:id` - 获取题目
- `POST /api/questions/:id/answer` - 提交答案

### 每日任务
- `GET /api/daily/status` - 获取每日状态
- `GET /api/daily/quests` - 获取每日任务
- `POST /api/daily/quests/:id/claim` - 领取任务奖励

### AI 助教
- `POST /api/ai/chat` - AI 对话
- `POST /api/ai/explain` - 代码解释
- `POST /api/ai/analyze-error` - 错误分析

## 开发指南

### 添加新题型
1. 在 `backend/prisma/schema.prisma` 中添加题型枚举
2. 在 `backend/src/routes/questions.ts` 中添加答案验证逻辑
3. 在 `frontend/src/components/Questions/` 中创建新的题型组件
4. 在 `QuestionRenderer.tsx` 中注册新组件

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用函数式写法 + Hooks

## License

MIT
