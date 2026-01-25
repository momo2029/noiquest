# API 接口参考

## 基础信息

- **Base URL**: `/api`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON

## 认证头

```
Authorization: Bearer <jwt-token>
```

## 错误响应格式

```json
{
  "error": "错误信息"
}
```

## 接口列表

### 认证模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/email-auth/send-code` | 发送验证码 | 否 |
| POST | `/email-auth/register` | 邮箱注册 | 否 |
| POST | `/email-auth/login` | 邮箱登录 | 否 |
| GET | `/email-auth/config` | 获取注册配置 | 否 |
| GET | `/auth/me` | 获取当前用户 | 是 |

### 技能树模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/skill-tree` | 获取技能树 | 是 |
| GET | `/skill-tree/units/:id` | 获取单元详情 | 是 |
| GET | `/skill-tree/lessons/:id` | 获取课程详情 | 是 |
| POST | `/skill-tree/lessons/:id/start` | 开始课程 | 是 |
| POST | `/skill-tree/lessons/:id/complete` | 完成课程 | 是 |

### 题目模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/questions/:id` | 获取题目 | 是 |
| POST | `/questions/:id/answer` | 提交答案 | 是 |
| GET | `/questions/:id/hint` | 获取提示 | 是 |

### AI 模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/ai/usage` | 获取使用状态 | 是 |
| POST | `/ai/chat` | 发送消息 | 是 |
| POST | `/ai/chat/stream` | 流式聊天 | 是 |
| POST | `/ai/explain` | 代码解释 | 是 |
| POST | `/ai/analyze-error` | 错误分析 | 是 |
| POST | `/ai/hint/:exerciseId` | 获取答题提示 | 是 |
| GET | `/ai/history` | 获取聊天历史 | 是 |

### 每日目标模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/daily/status` | 获取每日状态 | 是 |
| PUT | `/daily/goal` | 设置每日目标 | 是 |
| GET | `/daily/quests` | 获取每日任务 | 是 |
| POST | `/daily/quests/:id/claim` | 领取任务奖励 | 是 |
| GET | `/daily/history` | 获取历史记录 | 是 |

### 复习模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/review/status` | 获取复习状态 | 是 |
| GET | `/review/due` | 获取待复习内容 | 是 |
| POST | `/review/start` | 开始复习会话 | 是 |
| POST | `/review/complete` | 完成复习 | 是 |
| GET | `/review/mistakes` | 获取错题列表 | 是 |
| POST | `/review/mistakes/:id/review` | 标记已复习 | 是 |
| GET | `/review/mastery` | 获取知识点掌握度 | 是 |

### 邀请码模块

| 方法 | 路径 | 说明 | 认证 | 角色 |
|------|------|------|------|------|
| POST | `/invite/generate` | 生成邀请码 | 是 | ADMIN |
| POST | `/invite/verify` | 验证邀请码 | 否 | - |
| GET | `/invite` | 获取邀请码列表 | 是 | ADMIN |
| DELETE | `/invite/:id` | 删除邀请码 | 是 | ADMIN |
| DELETE | `/invite/expired/batch` | 批量删除过期 | 是 | ADMIN |

### 管理员模块

| 方法 | 路径 | 说明 | 认证 | 角色 |
|------|------|------|------|------|
| GET | `/admin/dashboard` | 仪表盘数据 | 是 | ADMIN |
| GET | `/admin/users` | 用户列表 | 是 | ADMIN |
| GET | `/admin/users/:id` | 用户详情 | 是 | ADMIN |
| PATCH | `/admin/users/:id` | 更新用户 | 是 | ADMIN |
| DELETE | `/admin/users/:id` | 删除用户 | 是 | ADMIN |
| GET | `/admin/classes` | 班级列表 | 是 | ADMIN |
| POST | `/admin/classes` | 创建班级 | 是 | ADMIN |
| GET | `/admin/classes/:id/students` | 班级学生 | 是 | ADMIN |
| PATCH | `/admin/classes/:id` | 更新班级 | 是 | ADMIN |
| DELETE | `/admin/classes/:id` | 删除班级 | 是 | ADMIN |
| GET | `/admin/exercises` | 题目列表 | 是 | ADMIN |
| GET | `/admin/units` | 单元列表 | 是 | ADMIN |
| GET | `/admin/analytics` | 数据分析 | 是 | ADMIN |
| GET | `/admin/settings` | 获取设置 | 是 | ADMIN |
| PUT | `/admin/settings` | 更新设置 | 是 | ADMIN |
| POST | `/admin/announcements` | 发布公告 | 是 | ADMIN |

### 用户模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/users/profile` | 获取个人资料 | 是 |
| PUT | `/users/profile` | 更新个人资料 | 是 |
| GET | `/users/stats` | 获取学习统计 | 是 |

### 班级模块 (教师)

| 方法 | 路径 | 说明 | 认证 | 角色 |
|------|------|------|------|------|
| GET | `/classes` | 获取班级列表 | 是 | TEACHER |
| POST | `/classes` | 创建班级 | 是 | TEACHER |
| GET | `/classes/:id` | 获取班级详情 | 是 | TEACHER |
| GET | `/classes/:id/students` | 获取班级学生 | 是 | TEACHER |

### 作业模块 (教师)

| 方法 | 路径 | 说明 | 认证 | 角色 |
|------|------|------|------|------|
| GET | `/homework` | 获取作业列表 | 是 | TEACHER |
| POST | `/homework` | 创建作业 | 是 | TEACHER |
| GET | `/homework/:id` | 获取作业详情 | 是 | TEACHER |
| GET | `/homework/:id/submissions` | 获取提交情况 | 是 | TEACHER |

## HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |
| 502 | 外部服务错误 |

## 分页参数

```
?page=1&limit=20
```

**响应:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
