import Editor from '@monaco-editor/react';
import { useRef, useCallback } from 'react';
import type { editor } from 'monaco-editor';
import { CodeFile, AppSettings } from '../../types';
import { Play, X, Loader2 } from 'lucide-react';

interface CodeEditorProps {
  file: CodeFile;
  files: CodeFile[];
  settings: AppSettings;
  onContentChange: (content: string) => void;
  onSelectionChange?: (selectedText: string) => void;
  onFileSelect: (fileId: string) => void;
  onFileClose: (fileId: string) => void;
  onRun: () => void;
  isRunning: boolean;
}

export default function CodeEditor({
  file,
  files,
  settings,
  onContentChange,
  onSelectionChange,
  onFileSelect,
  onFileClose,
  onRun,
  isRunning
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection();
      if (selection && onSelectionChange) {
        const selectedText = editor.getModel()?.getValueInRange(selection) || '';
        onSelectionChange(selectedText);
      }
    });
  }, [onSelectionChange]);

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e]">
      {/* 标签栏和运行按钮 */}
      <div className="h-9 bg-[#252526] border-b border-[#3c3c3c] flex items-center justify-between">
        {/* 文件标签 */}
        <div className="flex items-center h-full overflow-x-auto">
          {files.map(f => (
            <div
              key={f.id}
              onClick={() => onFileSelect(f.id)}
              className={`group flex items-center gap-2 h-full px-3 cursor-pointer border-r border-[#3c3c3c] ${
                f.id === file.id
                  ? 'bg-[#1e1e1e] text-white'
                  : 'bg-[#2d2d2d] text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-sm">{f.name}</span>
              {files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileClose(f.id);
                  }}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 运行按钮 */}
        <div className="flex items-center gap-2 px-3">
          <button
            onClick={onRun}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              isRunning
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20'
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                运行中...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                运行
              </>
            )}
          </button>
          <span className="text-xs text-gray-500">Ctrl+Enter</span>
        </div>
      </div>

      {/* 面包屑导航 */}
      <div className="h-6 bg-[#1e1e1e] border-b border-[#3c3c3c] flex items-center px-3">
        <span className="text-xs text-gray-500">
          <span className="text-gray-400">{file.name}</span>
        </span>
      </div>

      {/* 编辑器 */}
      <div className="flex-1">
        <Editor
          height="100%"
          language="cpp"
          value={file.content}
          onChange={(value) => onContentChange(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: settings.fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: settings.tabSize,
            wordWrap: 'on',
            lineNumbers: 'on',
            lineNumbersMinChars: 4,
            glyphMargin: true,
            folding: true,
            foldingHighlight: true,
            bracketPairColorization: { enabled: true },
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            formatOnPaste: true,
            suggestOnTriggerCharacters: true,
            padding: { top: 16, bottom: 16 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'all',
            renderWhitespace: 'selection',
            guides: {
              bracketPairs: true,
              indentation: true
            },
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
              useShadows: false
            }
          }}
        />
      </div>

      {/* 状态栏 */}
      <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 text-xs text-white">
        <div className="flex items-center gap-4">
          <span>C++</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Tab: {settings.tabSize}</span>
          <span>行 1, 列 1</span>
        </div>
      </div>
    </div>
  );
}
