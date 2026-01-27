# 代码编辑器 - 文件管理功能设计文档

## 1. 现状分析

### 当前问题
- 用户在"我的项目"中创建的文件仅存储在 React State 中
- 页面刷新后所有新建文件丢失，只剩下默认的 `main.cpp`
- 没有自动保存机制
- 没有持久化存储

### 现有组件
| 组件 | 路径 | 功能 |
|------|------|------|
| FileExplorer | `components/Editor/FileExplorer.tsx` | 资源管理器 UI |
| CodeEditor | `components/Editor/CodeEditor.tsx` | Monaco 代码编辑器 |
| OutputPanel | `components/Editor/OutputPanel.tsx` | 输出面板 |
| App.tsx | `App.tsx` | 文件状态管理 |

---

## 2. 功能需求

### 2.1 文件管理（仅支持 .cpp 文件）
- [x] 创建 `.cpp` 文件
- [ ] 重命名文件
- [x] 删除文件（需确认）
- [ ] 文件持久化存储（刷新不丢失）

### 2.2 自动保存
- [ ] 编辑时自动保存到 localStorage（防抖 1 秒）
- [ ] 定期同步到后端（30 秒）
- [ ] 保存状态指示（已保存/未保存/同步中）
- [ ] 离开页面前提示未保存

---

## 3. 技术方案：混合存储

### 存储策略

```
用户编辑 → localStorage（即时，1秒防抖）→ 后端数据库（30秒定期同步）
                ↓
         页面刷新时优先从 localStorage 恢复
                ↓
         登录时从后端拉取，与本地合并（后端优先）
```

### 数据流

1. **即时保存**：编辑后 1 秒自动保存到 localStorage
2. **定期同步**：每 30 秒将变更同步到后端
3. **启动加载**：
   - 已登录：从后端加载，合并本地未同步的变更
   - 未登录：仅从 localStorage 加载

---

## 4. 数据库模型

```prisma
// 用户代码文件（简化版，不需要项目概念）
model UserFile {
  id        String   @id @default(uuid())
  userId    String
  name      String                        // 文件名，如 main.cpp
  content   String   @db.Text             // 文件内容
  isActive  Boolean  @default(false)      // 是否为当前激活文件
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, name])                // 同一用户文件名唯一
  @@index([userId])
}
```

---

## 5. API 设计

### 5.1 文件接口

```typescript
// 获取用户所有文件
GET /api/user-files
Response: {
  files: Array<{
    id: string;
    name: string;
    content: string;
    isActive: boolean;
    updatedAt: string;
  }>;
  activeFileId: string | null;
}

// 同步文件（批量创建/更新/删除）
POST /api/user-files/sync
Body: {
  files: Array<{
    id: string;          // 本地生成的 ID
    name: string;
    content: string;
    isActive: boolean;
    updatedAt: string;   // 本地最后修改时间
    deleted?: boolean;   // 标记删除
  }>;
}
Response: {
  files: Array<{
    id: string;          // 服务端 ID
    localId: string;     // 本地 ID（用于映射）
    name: string;
    content: string;
    isActive: boolean;
    updatedAt: string;
  }>;
}

// 单文件保存（可选，用于手动保存）
PUT /api/user-files/:id
Body: { content: string }
Response: { success: boolean; updatedAt: string }
```

---

## 6. 前端实现

### 6.1 类型定义

```typescript
// types/index.ts
export interface CodeFile {
  id: string;
  name: string;           // 必须以 .cpp 结尾
  content: string;
  language: 'cpp';        // 固定为 cpp
  updatedAt: number;      // 时间戳，用于同步
  synced: boolean;        // 是否已同步到后端
}

export interface FileSyncState {
  isSaving: boolean;      // 正在保存到 localStorage
  isSyncing: boolean;     // 正在同步到后端
  lastSyncedAt: number | null;
  hasUnsyncedChanges: boolean;
}
```

### 6.2 Hook 设计

```typescript
// hooks/useUserFiles.ts
export function useUserFiles() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>('');
  const [syncState, setSyncState] = useState<FileSyncState>({...});

  // 文件操作
  const createFile = (name: string) => {...};
  const updateFileContent = (id: string, content: string) => {...};
  const renameFile = (id: string, newName: string) => {...};
  const deleteFile = (id: string) => {...};
  const selectFile = (id: string) => {...};

  // 同步操作
  const syncToBackend = async () => {...};
  const loadFromBackend = async () => {...};

  // 自动保存 effect
  useEffect(() => {
    // 1秒防抖保存到 localStorage
  }, [files]);

  // 定期同步 effect
  useEffect(() => {
    // 30秒定期同步到后端
  }, []);

  // 离开提示 effect
  useEffect(() => {
    // beforeunload 事件
  }, [syncState.hasUnsyncedChanges]);

  return {
    files,
    activeFile: files.find(f => f.id === activeFileId),
    activeFileId,
    syncState,
    createFile,
    updateFileContent,
    renameFile,
    deleteFile,
    selectFile,
    syncToBackend,
  };
}
```

### 6.3 localStorage 结构

```typescript
// key: 'noiquest_user_files'
interface LocalStorageData {
  files: CodeFile[];
  activeFileId: string;
  lastModified: number;
}
```

### 6.4 同步逻辑

```typescript
// 启动时加载
async function initializeFiles(isLoggedIn: boolean) {
  const localData = loadFromLocalStorage();

  if (isLoggedIn) {
    const remoteData = await api.getUserFiles();
    // 合并策略：以后端为准，但保留本地未同步的新文件
    const merged = mergeFiles(localData, remoteData);
    setFiles(merged);
    saveToLocalStorage(merged);
  } else {
    setFiles(localData.files);
  }
}

// 合并策略
function mergeFiles(local: LocalStorageData, remote: RemoteData): CodeFile[] {
  const merged: CodeFile[] = [];

  // 1. 添加所有远程文件
  for (const remoteFile of remote.files) {
    merged.push({
      ...remoteFile,
      synced: true,
    });
  }

  // 2. 添加本地未同步的新文件（名称不冲突的）
  for (const localFile of local.files) {
    if (!localFile.synced && !merged.some(f => f.name === localFile.name)) {
      merged.push(localFile);
    }
  }

  return merged;
}
```

---

## 7. UI 更新

### 7.1 FileExplorer 增强

```
┌─────────────────────────────┐
│ 资源管理器            [×]   │
├─────────────────────────────┤
│ ▼ 我的项目                  │
│   📄 main.cpp         [●]   │  ← [●] 表示未同步
│   📄 utils.cpp        [✓]   │  ← [✓] 表示已同步
│   📄 test.cpp               │
│                             │
│   [+ 新建文件]              │
├─────────────────────────────┤
│ 💾 已保存 · 同步中...       │  ← 状态栏
└─────────────────────────────┘
```

### 7.2 状态指示

| 状态 | 图标 | 说明 |
|------|------|------|
| 已保存已同步 | ✓ 绿色 | 本地和后端一致 |
| 已保存未同步 | ● 黄色 | 本地已保存，等待同步 |
| 正在保存 | ○ 动画 | 正在保存到 localStorage |
| 正在同步 | ↻ 动画 | 正在同步到后端 |
| 同步失败 | ✗ 红色 | 同步失败，点击重试 |

---

## 8. 文件结构

```
frontend/src/
├── hooks/
│   └── useUserFiles.ts           # 新增：文件管理 hook
├── components/
│   └── Editor/
│       ├── FileExplorer.tsx      # 更新：添加同步状态显示
│       └── SyncIndicator.tsx     # 新增：同步状态指示器
├── services/
│   ├── api.ts                    # 更新：添加文件同步 API
│   └── fileStorage.ts            # 新增：localStorage 操作
└── types/
    └── index.ts                  # 更新：添加文件类型

backend/
├── prisma/
│   └── schema.prisma             # 更新：添加 UserFile 模型
└── src/
    └── routes/
        └── user-files.ts         # 新增：文件管理路由
```

---

## 9. 实现步骤

### 第一步：后端
1. 添加 `UserFile` 数据库模型
2. 运行 `prisma migrate`
3. 创建 `/api/user-files` 路由

### 第二步：前端存储层
1. 创建 `fileStorage.ts` - localStorage 操作
2. 创建 `useUserFiles.ts` hook
3. 实现自动保存和同步逻辑

### 第三步：前端 UI
1. 更新 `FileExplorer.tsx` - 显示同步状态
2. 创建 `SyncIndicator.tsx` - 状态指示器
3. 更新 `App.tsx` - 集成新 hook

### 第四步：API 集成
1. 添加 API 方法到 `api.ts`
2. 实现登录后自动同步
3. 测试完整流程

---

## 10. 注意事项

1. **文件名验证**：只允许 `.cpp` 后缀，自动补全
2. **冲突处理**：同名文件以后端为准
3. **离线支持**：后端不可用时仍可本地使用
4. **错误重试**：同步失败自动重试 3 次
5. **数据清理**：用户删除账号时级联删除文件
