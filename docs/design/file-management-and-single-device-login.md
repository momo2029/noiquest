# 代码编辑器文件管理 + 单设备登录限制 设计文档

## 一、功能概述

### 1.1 单设备登录限制
- 一个账户同时只能在一个设备登录
- 新设备登录后，旧设备的 token 自动失效
- 旧设备下次请求时返回 401，提示重新登录

### 1.2 文件管理系统
- 支持创建、编辑、删除 .cpp 文件
- localStorage 即时保存，后端定期同步
- 每用户最多 50 个文件
- 本地缓存最近 10 个文件内容（LRU 策略）

### 1.3 路由记忆
- 页面刷新后保持当前视图
- 使用 localStorage 存储当前路由

---

## 二、单设备登录设计

### 2.1 方案：Token 版本控制

```
用户A在设备1登录 → tokenVersion=1 → 生成 token(v1)
用户A在设备2登录 → tokenVersion=2 → 生成 token(v2)
设备1请求 → token(v1) vs 数据库(v2) → 不匹配 → 401
```

### 2.2 数据库修改

```prisma
model User {
  // ... 现有字段
  tokenVersion  Int @default(0)  // 新增
}
```

### 2.3 登录流程修改

```typescript
// auth.ts / email-auth.ts 登录接口
async function login(credentials) {
  // 1. 验证用户凭证
  const user = await validateCredentials(credentials);

  // 2. 递增 tokenVersion
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { tokenVersion: { increment: 1 } },
  });

  // 3. 生成包含 tokenVersion 的 JWT
  const token = jwt.sign({
    id: user.id,
    username: user.username,
    role: user.role,
    tokenVersion: updatedUser.tokenVersion,  // 关键
  }, secret);

  return { user: updatedUser, token };
}
```

### 2.4 认证中间件修改

```typescript
// middleware/auth.ts
async function authenticate(req, res, next) {
  const decoded = jwt.verify(token, secret);

  // 查询用户当前 tokenVersion
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, username: true, role: true, tokenVersion: true },
  });

  // 比较版本号
  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new AppError('登录已失效，请重新登录', 401);
  }

  req.user = user;
  next();
}
```

### 2.5 前端处理

```typescript
// api.ts request 方法
if (response.status === 401) {
  const error = await response.json();
  if (error.error === '登录已失效，请重新登录') {
    // 清除本地 token
    this.setToken(null);
    // 触发登出事件，让 AuthContext 处理
    window.dispatchEvent(new CustomEvent('auth:logout', {
      detail: { reason: 'session_expired' }
    }));
  }
  throw new Error(error.error);
}
```

---

## 三、文件管理系统设计

### 3.1 存储架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端                                  │
├─────────────────────────────────────────────────────────────┤
│  localStorage                                                │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │ user_files_meta     │  │ user_file_content_{id}      │   │
│  │ (所有文件元信息)     │  │ (最近10个文件内容，LRU)      │   │
│  │ - id                │  │ - 完整代码内容               │   │
│  │ - name              │  └─────────────────────────────┘   │
│  │ - updatedAt         │                                    │
│  │ - isNew             │  ┌─────────────────────────────┐   │
│  │ - isModified        │  │ user_files_lru              │   │
│  └─────────────────────┘  │ (LRU 顺序列表)               │   │
│                           └─────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                        后端                                  │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL - UserFile 表                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ id visibleName content userId createdAt updatedAt   │    │
│  │ (完整数据，最多50个文件/用户)                         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 数据库模型

```prisma
model UserFile {
  id        String   @id @default(uuid())
  userId    String
  name      String   // 文件名，必须以 .cpp 结尾
  content   String   @db.Text

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, name])  // 同一用户文件名唯一
  @@index([userId])
  @@index([updatedAt])
}
```

### 3.3 API 设计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user-files` | 获取文件列表（仅元信息） |
| GET | `/api/user-files/:id` | 获取单个文件（含内容） |
| POST | `/api/user-files/sync` | 批量同步文件 |
| DELETE | `/api/user-files/:id` | 删除文件 |

#### 3.3.1 获取文件列表

```typescript
// GET /api/user-files
// Response
{
  files: [
    { id: "uuid", name: "main.cpp", updatedAt: "2024-01-01T00:00:00Z" },
    { id: "uuid", name: "solution.cpp", updatedAt: "2024-01-01T00:00:00Z" },
  ]
}
```

#### 3.3.2 获取单个文件

```typescript
// GET /api/user-files/:id
// Response
{
  file: {
    id: "uuid",
    name: "main.cpp",
    content: "#include <iostream>...",
    updatedAt: "2024-01-01T00:00:00Z"
  }
}
```

#### 3.3.3 批量同步

```typescript
// POST /api/user-files/sync
// Request
{
  files: [
    { id: "uuid", name: "main.cpp", content: "..." },      // 更新
    { name: "new.cpp", content: "..." },                    // 新建（无id）
  ],
  deletedIds: ["uuid1", "uuid2"]  // 要删除的文件
}

// Response
{
  message: "同步成功",
  files: [
    { id: "uuid", name: "main.cpp", updatedAt: "..." },
    { id: "new-uuid", name: "new.cpp", updatedAt: "..." },
  ]
}
```

### 3.4 前端文件存储服务 (fileStorage.ts)

```typescript
// 存储 key 常量
const STORAGE_KEY_META = 'user_files_meta';
const STORAGE_KEY_CONTENT_PREFIX = 'user_file_content_';
const STORAGE_KEY_LRU = 'user_files_lru';
const MAX_CACHED_CONTENTS = 10;

// 核心接口
interface FileMetadata {
  id: string;
  name: string;
  updatedAt: string;
  isNew?: boolean;      // 新建未同步
  isModified?: boolean; // 修改未同步
}

// 核心函数
function getFilesMetadata(): FileMetadata[];
function saveFilesMetadata(files: FileMetadata[]): void;
function getFileContent(fileId: string): string | null;
function saveFileContent(fileId: string, content: string): void;
function deleteFile(fileId: string): void;
function isContentCached(fileId: string): boolean;
function getFilesToSync(): FileWithContent[];
function markFilesSynced(fileIds: string[]): void;
function initFromBackend(files: BackendFile[]): void;
function clearAllFiles(): void;
```

### 3.5 前端 Hook (useUserFiles.ts)

```typescript
function useUserFiles(isAuthenticated: boolean) {
  // 状态
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>('');
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);  // 打开的标签页
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 返回
  return {
    // 状态
    files,              // 所有文件列表
    activeFile,         // 当前激活的文件
    activeFileId,       // 当前激活的文件 ID
    openFileIds,        // 打开的标签页 ID 列表
    isLoading,
    isSyncing,

    // 文件操作
    createFile,         // 创建新文件
    deleteFile,         // 删除文件（需确认）
    renameFile,         // 重命名文件

    // 标签页操作
    openFile,           // 打开文件（添加到标签页）
    closeFile,          // 关闭标签页（不删除文件）
    setActiveFileId,    // 切换激活的标签页

    // 内容操作
    updateFileContent,  // 更新文件内容

    // 同步
    syncToBackend,      // 手动触发同步
  };
}
```

### 3.6 同步策略

```
┌─────────────────────────────────────────────────────────────┐
│                      同步时机                                │
├─────────────────────────────────────────────────────────────┤
│ 1. 内容修改后 1 秒（防抖）                                    │
│ 2. 每 30 秒定时同步                                          │
│ 3. 页面关闭前 (beforeunload)                                 │
│ 4. 切换到其他视图时                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      冲突处理                                │
├─────────────────────────────────────────────────────────────┤
│ 策略：本地优先（Last Write Wins）                            │
│ - 本地修改会覆盖服务器版本                                    │
│ - 适合单设备登录场景（不会有多设备冲突）                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 四、编辑器标签页设计

### 4.1 标签页 vs 文件的区别

```
文件列表（FileExplorer）          标签页（Tabs）
┌─────────────────────┐          ┌─────────────────────────────┐
│ 📁 所有文件          │          │ [main.cpp] [util.cpp] [×]   │
│   main.cpp          │          └─────────────────────────────┘
│   util.cpp          │
│   helper.cpp        │          打开的文件（可关闭标签页）
│   test.cpp          │          关闭标签页 ≠ 删除文件
└─────────────────────┘
```

### 4.2 交互设计

| 操作 | 行为 |
|------|------|
| 点击文件列表中的文件 | 打开文件（添加到标签页并激活） |
| 点击标签页 | 切换到该文件 |
| 点击标签页的 × | 关闭标签页（文件仍在列表中） |
| 右键文件 → 删除 | 弹出确认框，确认后删除文件 |
| 点击删除图标 | 弹出确认框，确认后删除文件 |

### 4.3 删除确认设计

```typescript
// 删除确认对话框
function confirmDelete(fileName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const confirmed = window.confirm(
      `确定要删除文件 "${fileName}" 吗？\n\n此操作不可恢复。`
    );
    resolve(confirmed);
  });
}

// 或使用自定义 Modal 组件
<ConfirmModal
  isOpen={showDeleteConfirm}
  title="删除文件"
  message={`确定要删除文件 "${fileToDelete?.name}" 吗？`}
  confirmText="删除"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => setShowDeleteConfirm(false)}
/>
```

---

## 五、路由记忆设计

### 5.1 存储方案

```typescript
const STORAGE_KEY_CURRENT_VIEW = 'current_view';

// 保存当前视图
function saveCurrentView(view: string): void {
  localStorage.setItem(STORAGE_KEY_CURRENT_VIEW, view);
}

// 获取保存的视图
function getSavedView(defaultView: string): string {
  return localStorage.getItem(STORAGE_KEY_CURRENT_VIEW) || defaultView;
}
```

### 5.2 App.tsx 修改

```typescript
function MainApp() {
  const userRole = ...;
  const defaultView = userRole === 'student' ? 'skill-tree' : 'dashboard';

  // 从 localStorage 恢复视图
  const [currentView, setCurrentView] = useState<string>(() => {
    return getSavedView(defaultView);
  });

  // 视图变化时保存
  useEffect(() => {
    saveCurrentView(currentView);
  }, [currentView]);

  // 角色变化时重置为默认视图
  useEffect(() => {
    const savedView = getSavedView(defaultView);
    // 验证保存的视图对当前角色是否有效
    if (!isValidViewForRole(savedView, userRole)) {
      setCurrentView(defaultView);
    }
  }, [userRole]);
}
```

### 5.3 有效视图验证

```typescript
const STUDENT_VIEWS = ['skill-tree', 'review', 'editor', 'exercises', 'progress', 'leaderboard', 'achievements', 'analytics'];
const TEACHER_VIEWS = ['dashboard', 'students', 'assignments'];

function isValidViewForRole(view: string, role: UserRole): boolean {
  if (role === 'student') {
    return STUDENT_VIEWS.includes(view);
  } else if (role === 'teacher') {
    return TEACHER_VIEWS.includes(view);
  }
  return false;
}
```

---

## 六、文件修改清单

### 6.1 后端文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `prisma/schema.prisma` | 修改 | User 添加 tokenVersion，新增 UserFile 模型 |
| `src/routes/auth.ts` | 修改 | 登录时递增 tokenVersion |
| `src/routes/email-auth.ts` | 修改 | 同上 |
| `src/middleware/auth.ts` | 修改 | 验证 tokenVersion |
| `src/routes/user-files.ts` | 新建 | 文件管理 API |
| `src/index.ts` | 修改 | 注册路由 |

### 6.2 前端文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/services/fileStorage.ts` | 新建 | localStorage 文件存储 |
| `src/hooks/useUserFiles.ts` | 新建 | 文件管理 Hook |
| `src/services/api.ts` | 修改 | 添加文件 API，处理 401 |
| `src/contexts/AuthContext.tsx` | 修改 | 监听登出事件 |
| `src/components/Editor/CodeEditor.tsx` | 修改 | 标签页关闭逻辑 |
| `src/components/Editor/FileExplorer.tsx` | 修改 | 删除确认 |
| `src/App.tsx` | 修改 | 集成 Hook，路由记忆 |
| `src/utils/storage.ts` | 修改 | 添加视图存储函数 |

---

## 七、实现顺序

### 阶段一：单设备登录（后端）
1. schema.prisma 添加 tokenVersion
2. prisma migrate
3. 修改 auth.ts 和 email-auth.ts
4. 修改 auth middleware

### 阶段二：单设备登录（前端）
1. 修改 api.ts 处理 401
2. 修改 AuthContext 监听登出事件

### 阶段三：文件管理后端
1. schema.prisma 添加 UserFile
2. prisma migrate
3. 创建 user-files.ts 路由
4. 注册路由

### 阶段四：文件管理前端
1. 创建 fileStorage.ts
2. 创建 useUserFiles.ts
3. 修改 api.ts 添加文件 API
4. 修改 CodeEditor 和 FileExplorer
5. 修改 App.tsx 集成

### 阶段五：路由记忆
1. 修改 storage.ts 添加视图存储
2. 修改 App.tsx 实现路由记忆

---

## 八、测试用例

### 8.1 单设备登录测试

| 测试场景 | 预期结果 |
|----------|----------|
| 设备A登录 → 设备B登录 → 设备A刷新 | 设备A提示重新登录 |
| 设备A登录 → 设备A刷新 | 正常使用 |
| 设备A登录 → 设备A登出 → 设备A登录 | 正常使用 |

### 8.2 文件管理测试

| 测试场景 | 预期结果 |
|----------|----------|
| 创建文件 → 刷新页面 | 文件仍存在 |
| 创建 15 个文件 | localStorage 只缓存 10 个内容 |
| 切换到未缓存文件 | 自动从后端加载 |
| 点击标签页 × | 关闭标签页，文件仍在列表 |
| 点击删除图标 | 弹出确认框 |
| 确认删除 | 文件从列表和后端删除 |
| 创建 51 个文件 | 提示超过限制 |

### 8.3 路由记忆测试

| 测试场景 | 预期结果 |
|----------|----------|
| 在编辑器页面刷新 | 仍在编辑器页面 |
| 在排行榜页面刷新 | 仍在排行榜页面 |
| 学生切换到教师账号 | 显示教师默认视图 |
