// 文件存储服务 - localStorage + LRU 缓存

export interface FileMetadata {
  id: string;
  name: string;
  updatedAt: string;
  isNew?: boolean;      // 是否是新创建的文件（还未同步到后端）
  isModified?: boolean; // 是否有未同步的修改
}

export interface FileWithContent extends FileMetadata {
  content: string;
}

const STORAGE_KEY_META = 'user_files_meta';
const STORAGE_KEY_CONTENT_PREFIX = 'user_file_content_';
const STORAGE_KEY_LRU = 'user_files_lru';
const MAX_CACHED_CONTENTS = 10;

// 获取所有文件元信息
export function getFilesMetadata(): FileMetadata[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_META);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存文件元信息
export function saveFilesMetadata(files: FileMetadata[]): void {
  localStorage.setItem(STORAGE_KEY_META, JSON.stringify(files));
}

// 获取 LRU 列表（最近访问的文件 ID 列表）
function getLruList(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_LRU);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存 LRU 列表
function saveLruList(list: string[]): void {
  localStorage.setItem(STORAGE_KEY_LRU, JSON.stringify(list));
}

// 更新 LRU（将文件 ID 移到最前面）
function updateLru(fileId: string): void {
  const list = getLruList().filter(id => id !== fileId);
  list.unshift(fileId);

  // 如果超过限制，删除最旧的文件内容
  while (list.length > MAX_CACHED_CONTENTS) {
    const oldestId = list.pop();
    if (oldestId) {
      localStorage.removeItem(STORAGE_KEY_CONTENT_PREFIX + oldestId);
    }
  }

  saveLruList(list);
}

// 获取文件内容（从 localStorage）
export function getFileContent(fileId: string): string | null {
  try {
    const content = localStorage.getItem(STORAGE_KEY_CONTENT_PREFIX + fileId);
    if (content !== null) {
      updateLru(fileId);
    }
    return content;
  } catch {
    return null;
  }
}

// 保存文件内容到 localStorage
export function saveFileContent(fileId: string, content: string): void {
  localStorage.setItem(STORAGE_KEY_CONTENT_PREFIX + fileId, content);
  updateLru(fileId);
}

// 删除文件内容
export function deleteFileContent(fileId: string): void {
  localStorage.removeItem(STORAGE_KEY_CONTENT_PREFIX + fileId);
  const list = getLruList().filter(id => id !== fileId);
  saveLruList(list);
}

// 获取完整文件（元信息 + 内容）
export function getFullFile(fileId: string): FileWithContent | null {
  const files = getFilesMetadata();
  const meta = files.find(f => f.id === fileId);
  if (!meta) return null;

  const content = getFileContent(fileId);
  if (content === null) return null;

  return { ...meta, content };
}

// 保存完整文件
export function saveFullFile(file: FileWithContent): void {
  const files = getFilesMetadata();
  const index = files.findIndex(f => f.id === file.id);

  const meta: FileMetadata = {
    id: file.id,
    name: file.name,
    updatedAt: file.updatedAt,
    isNew: file.isNew,
    isModified: file.isModified,
  };

  if (index >= 0) {
    files[index] = meta;
  } else {
    files.push(meta);
  }

  saveFilesMetadata(files);
  saveFileContent(file.id, file.content);
}

// 删除文件
export function deleteFile(fileId: string): void {
  const files = getFilesMetadata().filter(f => f.id !== fileId);
  saveFilesMetadata(files);
  deleteFileContent(fileId);
}

// 检查文件内容是否已缓存
export function isContentCached(fileId: string): boolean {
  return localStorage.getItem(STORAGE_KEY_CONTENT_PREFIX + fileId) !== null;
}

// 获取所有已缓存内容的文件 ID
export function getCachedFileIds(): string[] {
  return getLruList();
}

// 清除所有文件数据
export function clearAllFiles(): void {
  const lruList = getLruList();
  for (const id of lruList) {
    localStorage.removeItem(STORAGE_KEY_CONTENT_PREFIX + id);
  }
  localStorage.removeItem(STORAGE_KEY_META);
  localStorage.removeItem(STORAGE_KEY_LRU);
}

// 从后端数据初始化本地存储
export function initFromBackend(files: { id: string; name: string; updatedAt: string }[]): void {
  const existingMeta = getFilesMetadata();
  const existingMap = new Map(existingMeta.map(f => [f.id, f]));

  const newMeta: FileMetadata[] = files.map(f => {
    const existing = existingMap.get(f.id);
    return {
      id: f.id,
      name: f.name,
      updatedAt: f.updatedAt,
      isNew: false,
      isModified: existing?.isModified || false,
    };
  });

  // 保留本地新建但未同步的文件
  for (const existing of existingMeta) {
    if (existing.isNew && !files.find(f => f.id === existing.id)) {
      newMeta.push(existing);
    }
  }

  saveFilesMetadata(newMeta);
}

// 获取需要同步的文件（新建或修改的）
export function getFilesToSync(): FileWithContent[] {
  const files = getFilesMetadata();
  const toSync: FileWithContent[] = [];

  for (const meta of files) {
    if (meta.isNew || meta.isModified) {
      const content = getFileContent(meta.id);
      if (content !== null) {
        toSync.push({ ...meta, content });
      }
    }
  }

  return toSync;
}

// 标记文件为已同步
export function markFilesSynced(fileIds: string[]): void {
  const files = getFilesMetadata();
  for (const file of files) {
    if (fileIds.includes(file.id)) {
      file.isNew = false;
      file.isModified = false;
    }
  }
  saveFilesMetadata(files);
}

// 生成临时 ID（用于新文件）
export function generateTempId(): string {
  return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 更新文件 ID（同步后用后端返回的真实 ID 替换临时 ID）
export function updateFileId(oldId: string, newId: string): void {
  const files = getFilesMetadata();
  const file = files.find(f => f.id === oldId);
  if (file) {
    file.id = newId;
    saveFilesMetadata(files);

    // 更新内容存储的 key
    const content = localStorage.getItem(STORAGE_KEY_CONTENT_PREFIX + oldId);
    if (content !== null) {
      localStorage.setItem(STORAGE_KEY_CONTENT_PREFIX + newId, content);
      localStorage.removeItem(STORAGE_KEY_CONTENT_PREFIX + oldId);
    }

    // 更新 LRU 列表
    const lru = getLruList().map(id => id === oldId ? newId : id);
    saveLruList(lru);
  }
}
