import { useState } from 'react';
import { CodeFile } from '../../types';
import { ChevronDown, ChevronRight, File, FilePlus, Trash2, X } from 'lucide-react';

interface FileExplorerProps {
  files: CodeFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string) => void;
  onDeleteFile: (fileId: string) => void;
  onClose: () => void;
}

export default function FileExplorer({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onClose
}: FileExplorerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setShowNewFile(false);
    }
  };

  return (
    <div className="w-56 bg-[#252526] border-r border-[#3c3c3c] flex flex-col flex-shrink-0">
      {/* 头部 */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-[#3c3c3c]">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">资源管理器</span>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-white hover:bg-gray-700 rounded"
        >
          <X size={14} />
        </button>
      </div>

      {/* 项目文件夹 */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-[#2a2d2e] text-gray-300"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="text-sm font-medium">我的项目</span>
        </div>

        {isExpanded && (
          <div className="pl-4">
            {/* 文件列表 */}
            {files.map(file => (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center justify-between px-2 py-1 cursor-pointer rounded-sm ${
                  file.id === activeFileId
                    ? 'bg-[#37373d] text-white'
                    : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <File size={14} className="text-blue-400" />
                  <span className="text-sm">{file.name}</span>
                </div>
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file.id);
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}

            {/* 新建文件输入 */}
            {showNewFile && (
              <div className="px-2 py-1">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFile();
                    if (e.key === 'Escape') setShowNewFile(false);
                  }}
                  onBlur={() => {
                    if (!newFileName.trim()) setShowNewFile(false);
                  }}
                  placeholder="文件名.cpp"
                  className="w-full px-2 py-1 text-sm bg-[#3c3c3c] border border-blue-500 rounded text-white placeholder-gray-500 focus:outline-none"
                  autoFocus
                />
              </div>
            )}

            {/* 新建文件按钮 */}
            <button
              onClick={() => setShowNewFile(true)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-gray-500 hover:text-gray-300 hover:bg-[#2a2d2e] rounded-sm"
            >
              <FilePlus size={14} />
              <span className="text-sm">新建文件</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
