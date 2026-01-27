/**
 * 用户文件管理 Hook
 *
 * 功能：
 * - 文件的 CRUD 操作
 * - 标签页管理（打开/关闭）
 * - localStorage 即时保存
 * - 后端定期同步
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import {
  getFilesMetadata,
  getFileContent,
  saveFileContent,
  deleteFile as deleteLocalFile,
  saveFullFile,
  isContentCached,
  initFromBackend,
  getFilesToSync,
  markFilesSynced,
  generateTempId,
  clearAllFiles,
  updateFileId,
  FileMetadata,
} from '../services/fileStorage';

export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

const DEFAULT_FILE_CONTENT = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`;

const SYNC_INTERVAL = 30000; // 30秒同步一次
const DEBOUNCE_DELAY = 1000; // 1秒防抖

export function useUserFiles(isAuthenticated: boolean) {
  // 文件状态
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileIdState] = useState<string>('');
  const [openFileIds, setOpenFileIds] = useState<string[]>([]); // 打开的标签页

  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Refs
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const filesRef = useRef<CodeFile[]>(files);

  // 保持 filesRef 同步
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // ==================== 从后端加载文件 ====================

  const loadFilesFromBackend = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.getUserFiles();
      initFromBackend(response.files);

      // 转换为 CodeFile 格式
      const localMeta = getFilesMetadata();
      const codeFiles: CodeFile[] = [];

      for (const meta of localMeta) {
        const content = getFileContent(meta.id) || '';
        codeFiles.push({
          id: meta.id,
          name: meta.name,
          content,
          language: 'cpp',
        });
      }

      // 如果没有文件，创建默认文件
      if (codeFiles.length === 0) {
        const defaultFile = createDefaultFile();
        codeFiles.push(defaultFile);
      }

      setFiles(codeFiles);

      // 默认打开第一个文件
      if (codeFiles.length > 0) {
        setActiveFileIdState(codeFiles[0].id);
        setOpenFileIds([codeFiles[0].id]);
      }
    } catch (error) {
      console.error('加载文件失败:', error);
      loadFilesFromLocal();
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // ==================== 从本地加载文件 ====================

  const loadFilesFromLocal = useCallback(() => {
    const localMeta = getFilesMetadata();
    const codeFiles: CodeFile[] = [];

    for (const meta of localMeta) {
      const content = getFileContent(meta.id) || '';
      codeFiles.push({
        id: meta.id,
        name: meta.name,
        content,
        language: 'cpp',
      });
    }

    if (codeFiles.length === 0) {
      const defaultFile = createDefaultFile();
      codeFiles.push(defaultFile);
    }

    setFiles(codeFiles);

    if (codeFiles.length > 0) {
      setActiveFileIdState(codeFiles[0].id);
      setOpenFileIds([codeFiles[0].id]);
    }

    setIsLoading(false);
  }, []);

  // ==================== 创建默认文件 ====================

  const createDefaultFile = (): CodeFile => {
    const id = generateTempId();
    const file: CodeFile = {
      id,
      name: 'main.cpp',
      content: DEFAULT_FILE_CONTENT,
      language: 'cpp',
    };

    saveFullFile({
      id,
      name: file.name,
      content: file.content,
      updatedAt: new Date().toISOString(),
      isNew: true,
    });

    return file;
  };

  // ==================== 按需加载文件内容 ====================

  const loadFileContent = useCallback(async (fileId: string) => {
    // 如果已缓存，从本地读取
    if (isContentCached(fileId)) {
      const content = getFileContent(fileId);
      if (content !== null) {
        setFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, content } : f
        ));
        return;
      }
    }

    // 从后端加载
    if (!isAuthenticated) return;

    try {
      const response = await api.getUserFile(fileId);
      const content = response.file.content;

      saveFileContent(fileId, content);

      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, content } : f
      ));
    } catch (error) {
      console.error('加载文件内容失败:', error);
    }
  }, [isAuthenticated]);

  // ==================== 同步到后端 ====================

  const syncToBackend = useCallback(async () => {
    if (!isAuthenticated || isSyncing) return;

    const filesToSync = getFilesToSync();
    if (filesToSync.length === 0) return;

    setIsSyncing(true);
    try {
      const response = await api.syncUserFiles({
        files: filesToSync.map(f => ({
          id: f.isNew ? undefined : f.id,
          name: f.name,
          content: f.content,
        })),
      });

      // 标记为已同步
      markFilesSynced(filesToSync.map(f => f.id));

      // 更新临时 ID 为真实 ID
      const idMap = new Map<string, string>();
      for (let i = 0; i < filesToSync.length; i++) {
        const oldFile = filesToSync[i];
        const newFile = response.files[i];
        if (oldFile.isNew && newFile && oldFile.id !== newFile.id) {
          idMap.set(oldFile.id, newFile.id);
          updateFileId(oldFile.id, newFile.id);
        }
      }

      if (idMap.size > 0) {
        setFiles(prev => prev.map(f => {
          const newId = idMap.get(f.id);
          return newId ? { ...f, id: newId } : f;
        }));

        setOpenFileIds(prev => prev.map(id => idMap.get(id) || id));

        setActiveFileIdState(prev => idMap.get(prev) || prev);
      }
    } catch (error) {
      console.error('同步失败:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, isSyncing]);

  // ==================== 文件操作 ====================

  const updateFileContent = useCallback((content: string) => {
    const currentActiveId = activeFileId;

    setFiles(prev => prev.map(f =>
      f.id === currentActiveId ? { ...f, content } : f
    ));

    // 立即保存到 localStorage
    const file = filesRef.current.find(f => f.id === currentActiveId);
    if (file) {
      const meta = getFilesMetadata().find((m: FileMetadata) => m.id === currentActiveId);
      saveFullFile({
        id: currentActiveId,
        name: file.name,
        content,
        updatedAt: new Date().toISOString(),
        isNew: meta?.isNew || false,
        isModified: true,
      });
    }

    // 防抖同步到后端
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      syncToBackend();
    }, DEBOUNCE_DELAY);
  }, [activeFileId, syncToBackend]);

  const createFile = useCallback((name: string) => {
    const fileName = name.endsWith('.cpp') ? name : `${name}.cpp`;

    // 检查文件名是否已存在
    if (filesRef.current.some(f => f.name === fileName)) {
      alert('文件名已存在');
      return;
    }

    const id = generateTempId();
    const newFile: CodeFile = {
      id,
      name: fileName,
      content: DEFAULT_FILE_CONTENT,
      language: 'cpp',
    };

    setFiles(prev => [...prev, newFile]);
    setOpenFileIds(prev => [...prev, id]);
    setActiveFileIdState(id);

    saveFullFile({
      id,
      name: fileName,
      content: DEFAULT_FILE_CONTENT,
      updatedAt: new Date().toISOString(),
      isNew: true,
    });

    // 触发同步
    setTimeout(() => syncToBackend(), 100);
  }, [syncToBackend]);

  const deleteFileById = useCallback(async (id: string): Promise<boolean> => {
    if (filesRef.current.length <= 1) {
      alert('至少保留一个文件');
      return false;
    }

    const file = filesRef.current.find(f => f.id === id);
    if (!file) return false;

    // 确认删除
    const confirmed = window.confirm(`确定要删除文件 "${file.name}" 吗？\n\n此操作不可恢复。`);
    if (!confirmed) return false;

    // 从本地删除
    deleteLocalFile(id);

    // 更新状态
    setFiles(prev => prev.filter(f => f.id !== id));
    setOpenFileIds(prev => prev.filter(fid => fid !== id));

    // 如果删除的是当前文件，切换到其他文件
    if (activeFileId === id) {
      const remaining = filesRef.current.filter(f => f.id !== id);
      const newActiveId = remaining[0]?.id || '';
      setActiveFileIdState(newActiveId);
      if (newActiveId && !openFileIds.includes(newActiveId)) {
        setOpenFileIds(prev => [...prev.filter(fid => fid !== id), newActiveId]);
      }
    }

    // 从后端删除（如果不是临时文件）
    if (!id.startsWith('temp_') && isAuthenticated) {
      try {
        await api.deleteUserFile(id);
      } catch (error) {
        console.error('删除文件失败:', error);
      }
    }

    return true;
  }, [activeFileId, openFileIds, isAuthenticated]);

  // ==================== 标签页操作 ====================

  const openFile = useCallback((fileId: string) => {
    // 添加到打开的标签页
    if (!openFileIds.includes(fileId)) {
      setOpenFileIds(prev => [...prev, fileId]);
    }
    setActiveFileIdState(fileId);

    // 如果内容未缓存，加载内容
    const file = filesRef.current.find(f => f.id === fileId);
    if (file && !file.content && !isContentCached(fileId)) {
      loadFileContent(fileId);
    }
  }, [openFileIds, loadFileContent]);

  const closeFile = useCallback((fileId: string) => {
    // 从打开的标签页中移除
    const newOpenIds = openFileIds.filter(id => id !== fileId);
    setOpenFileIds(newOpenIds);

    // 如果关闭的是当前文件，切换到其他打开的文件
    if (activeFileId === fileId && newOpenIds.length > 0) {
      setActiveFileIdState(newOpenIds[newOpenIds.length - 1]);
    } else if (newOpenIds.length === 0) {
      // 如果没有打开的文件了，打开第一个文件
      const firstFile = filesRef.current[0];
      if (firstFile) {
        setOpenFileIds([firstFile.id]);
        setActiveFileIdState(firstFile.id);
      }
    }
  }, [openFileIds, activeFileId]);

  const setActiveFileId = useCallback((fileId: string) => {
    openFile(fileId);
  }, [openFile]);

  // ==================== 初始化 ====================

  useEffect(() => {
    if (isAuthenticated) {
      loadFilesFromBackend();
    } else {
      loadFilesFromLocal();
    }
  }, [isAuthenticated, loadFilesFromBackend, loadFilesFromLocal]);

  // ==================== 定时同步 ====================

  useEffect(() => {
    if (isAuthenticated) {
      syncIntervalRef.current = setInterval(() => {
        syncToBackend();
      }, SYNC_INTERVAL);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated, syncToBackend]);

  // ==================== 页面关闭前同步 ====================

  useEffect(() => {
    const handleBeforeUnload = () => {
      // 同步保存到 localStorage（已经是即时保存的，这里主要是确保）
      const filesToSync = getFilesToSync();
      if (filesToSync.length > 0 && isAuthenticated) {
        // 使用 sendBeacon 发送同步请求
        const data = JSON.stringify({
          files: filesToSync.map(f => ({
            id: f.isNew ? undefined : f.id,
            name: f.name,
            content: f.content,
          })),
        });
        navigator.sendBeacon('/api/user-files/sync', new Blob([data], { type: 'application/json' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated]);

  // ==================== 清理 ====================

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  const clearLocalData = useCallback(() => {
    clearAllFiles();
    setFiles([]);
    setActiveFileIdState('');
    setOpenFileIds([]);
  }, []);

  // ==================== 返回值 ====================

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  return {
    // 状态
    files,
    activeFile,
    activeFileId,
    openFileIds,
    isLoading,
    isSyncing,

    // 文件操作
    createFile,
    deleteFile: deleteFileById,
    updateFileContent,

    // 标签页操作
    openFile,
    closeFile,
    setActiveFileId,

    // 同步
    syncToBackend,
    clearLocalData,
  };
}
