# NOI Quest 系统设计文档

## 项目概述

NOI Quest 是一个面向初中生的 C++ 编程学习平台，采用游戏化设计，帮助学生备战 CSP-J、CSP-S 和 NOI 竞赛。

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS + Vite
- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **AI**: 豆包 API (字节跳动)

## 文档目录

```
docs/
├── README.md                    # 本文件
├── architecture/                # 架构设计
│   ├── system-overview.md       # 系统架构概览
│   ├── database-design.md       # 数据库设计
│   └── tech-stack.md            # 技术栈说明
├── modules/                     # 功能模块
│   ├── auth.md                  # 认证模块
│   ├── skill-tree.md            # 技能树/学习之旅
│   ├── exercise.md              # 题目系统
│   ├── ai-assistant.md          # AI 助手
│   ├── review.md                # 复习系统
│   ├── gamification.md          # 游戏化系统
│   ├── admin.md                 # 管理员模块
│   └── invite.md                # 邀请码系统
├── api/                         # API 文档
│   └── api-reference.md         # API 接口参考
└── flows/                       # 流程图
    ├── user-journey.md          # 用户旅程
    └── data-flow.md             # 数据流
```

## 用户角色

| 角色 | 说明 | 主要功能 |
|------|------|----------|
| STUDENT | 学生 | 学习、答题、复习、AI问答 |
| TEACHER | 教师 | 班级管理、作业布置、学生进度查看 |
| ADMIN | 管理员 | 用户管理、系统配置、数据分析 |

## 核心功能

1. **技能树学习** - 多邻国风格的闯关学习
2. **多题型支持** - 填空、选择、排序、配对、改错、编程
3. **AI 助手** - 智能答疑、代码解释、错误分析
4. **游戏化** - XP、等级、连续学习、生命值、宝石
5. **复习系统** - 错题本、知识点复习
6. **管理后台** - 用户、班级、积分、邀请码管理
