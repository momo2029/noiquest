# 认证模块

## 概述

认证模块负责用户注册、登录、权限验证等功能。支持邮箱+验证码注册和邮箱+密码登录。

## 流程图

### 注册流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant E as 邮件服务
    participant D as 数据库

    U->>F: 输入邮箱
    F->>B: POST /api/email-auth/send-code
    B->>B: 生成6位验证码
    B->>D: 保存验证码(5分钟有效)
    B->>E: 发送验证码邮件
    E-->>U: 收到验证码
    B-->>F: 发送成功

    U->>F: 输入验证码+密码+姓名
    F->>B: POST /api/email-auth/register

    alt 需要邀请码
        B->>D: 验证邀请码
        alt 邀请码无效
            B-->>F: 错误: 邀请码无效
        end
        B->>D: 更新邀请码使用次数
    end

    B->>D: 验证验证码
    alt 验证码错误/过期
        B-->>F: 错误: 验证码错误
    end

    B->>D: 检查邮箱是否已注册
    alt 已注册
        B-->>F: 错误: 邮箱已注册
    end

    B->>B: 密码加密(bcrypt)
    B->>D: 创建用户
    B->>D: 标记验证码已使用
    B->>B: 生成JWT Token
    B-->>F: 返回用户信息+Token
    F->>F: 保存Token到localStorage
    F-->>U: 注册成功，进入主页
```

### 登录流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库

    U->>F: 输入邮箱+密码
    F->>B: POST /api/email-auth/login
    B->>D: 查询用户

    alt 用户不存在
        B-->>F: 错误: 邮箱或密码错误
    end

    B->>B: 验证密码(bcrypt.compare)

    alt 密码错误
        B-->>F: 错误: 邮箱或密码错误
    end

    B->>B: 生成JWT Token
    B-->>F: 返回用户信息+Token
    F->>F: 保存Token到localStorage
    F-->>U: 登录成功，进入主页
```

### 认证中间件流程

```mermaid
flowchart TD
    A[请求到达] --> B{有Authorization头?}
    B -->|否| C[返回401: 未提供认证令牌]
    B -->|是| D[提取Bearer Token]
    D --> E{Token格式正确?}
    E -->|否| C
    E -->|是| F[JWT验证]
    F --> G{Token有效?}
    G -->|否| H[返回401: 无效令牌]
    G -->|是| I[解析用户信息]
    I --> J[查询数据库获取用户]
    J --> K{用户存在?}
    K -->|否| L[返回401: 用户不存在]
    K -->|是| M[将用户信息附加到req.user]
    M --> N[继续处理请求]
```

## API 接口

### 发送验证码

```
POST /api/email-auth/send-code
```

**请求体:**
```json
{
  "email": "user@example.com"
}
```

**响应:**
```json
{
  "message": "验证码已发送到你的邮箱"
}
```

**错误:**
- 400: 邮箱格式错误
- 400: 验证码已发送，请稍后再试

### 注册

```
POST /api/email-auth/register
```

**请求体:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "password": "password123",
  "name": "张三",
  "role": "STUDENT",
  "inviteCode": "ABC12345"
}
```

**响应:**
```json
{
  "user": {
    "id": "uuid",
    "username": "user",
    "email": "user@example.com",
    "name": "张三",
    "role": "STUDENT",
    "level": 1,
    "xp": 0,
    "totalXp": 0,
    "streak": 0,
    "hearts": 5,
    "gems": 0
  },
  "token": "jwt-token"
}
```

### 登录

```
POST /api/email-auth/login
```

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应:** 同注册

### 获取当前用户

```
GET /api/auth/me
Authorization: Bearer <token>
```

**响应:**
```json
{
  "id": "uuid",
  "username": "user",
  "email": "user@example.com",
  "name": "张三",
  "role": "STUDENT",
  ...
}
```

### 获取注册配置

```
GET /api/email-auth/config
```

**响应:**
```json
{
  "inviteRequired": false
}
```

## 相关文件

| 文件 | 说明 |
|------|------|
| `backend/src/routes/email-auth.ts` | 邮箱认证路由 |
| `backend/src/routes/auth.ts` | 基础认证路由 |
| `backend/src/middleware/auth.ts` | 认证中间件 |
| `frontend/src/components/Auth/EmailLogin.tsx` | 登录组件 |
| `frontend/src/components/Auth/EmailRegister.tsx` | 注册组件 |
| `frontend/src/contexts/AuthContext.tsx` | 认证上下文 |

## JWT Token 结构

```json
{
  "id": "user-uuid",
  "username": "user",
  "role": "STUDENT",
  "iat": 1234567890,
  "exp": 1234567890
}
```

- 有效期: 7天 (可配置)
- 签名算法: HS256
