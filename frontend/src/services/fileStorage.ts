/**
 * 文件存储服务 - localStorage + LRU 缓存
 *
 * 存储结构：
 * - user_files_meta: 所有文件的元信息
 * - user_file_content_{id}: 单个文件的内容（最多缓存10个）
 * - user_files_lru: LRU 顺序列表
 */

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

// ==================== 元信息操作 ====================

export function getFilesMetadata(): FileMetadata[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_META);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFilesMetadata(files: FileMetadata[]): void {
  localStorage.setItem(STORAGE_KEY_META, JSON.stringify(files));
}

// ==================== LRU 缓存操作 ====================

function getLruList(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_LRU);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLruList(list: string[]): void {
  localStorage.setItem(STORAGE_KEY_LRU, JSON.stringify(list));
}

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

// ==================== 文件内容操作 ====================

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

export function saveFileContent(fileId: string, content: string): void {
  localStorage.setItem(STORAGE_KEY_CONTENT_PREFIX + fileId, content);
  updateLru(fileId);
}

export function deleteFileContent(fileId: string): void {
  localStorage.removeItem(STORAGE_KEY_CONTENT_PREFIX + fileId);
  const list = getLruList().filter(id => id !== fileId);
  saveLruList(list);
}

// ==================== 完整文件操作 ====================

export function getFullFile(fileId: string): FileWithContent | null {
  const files = getFilesMetadata();
  const meta = files.find(f => f.id === fileId);
  if (!meta) return null;

  const content = getFileContent(fileId);
  if (content === null) return null;

  return { ...meta, content };
}

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

export function deleteFile(fileId: string): void {
  const files = getFilesMetadata().filter(f => f.id !== fileId);
  saveFilesMetadata(files);
  deleteFileContent(fileId);
}

// ==================== 缓存状态查询 ====================

export function isContentCached(fileId: string): boolean {
  return localStorage.getItem(STORAGE_KEY_CONTENT_PREFIX + fileId) !== null;
}

export function getCachedFileIds(): string[] {
  return getLruList();
}

// ==================== 同步相关 ====================

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

// ==================== 工具函数 ====================

export function generateTempId(): string {
  return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
}

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

export function clearAllFiles(): void {
  const lruList = getLruList();
  for (const id of lruList) {
    localStorage.removeItem(STORAGE_KEY_CONTENT_PREFIX + id);
  }
  localStorage.removeItem(STORAGE_KEY_META);
  localStorage.removeItem(STORAGE_KEY_LRU);
}
