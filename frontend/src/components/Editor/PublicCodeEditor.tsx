import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, LogIn } from 'lucide-react';

interface PublicCodeEditorProps {
  onLoginRequired: () => void;
}

const DEFAULT_CODE = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, NOIQuest!" << endl;
    return 0;
}
`;

export default function PublicCodeEditor({ onLoginRequired }: PublicCodeEditorProps) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleRun = () => {
    setShowLoginPrompt(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e]">
      {/* 顶部栏 */}
      <div className="h-12 bg-[#252526] border-b border-[#3c3c3c] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-sm">main.cpp</span>
          <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">C++</span>
        </div>
        <button
          onClick={handleRun}
          className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Play size={16} />
          运行代码
        </button>
      </div>

      {/* 编辑器 */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="cpp"
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', 'Consolas', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
          }}
        />

        {/* 登录提示弹窗 */}
        {showLoginPrompt && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <div className="bg-[#252536] rounded-2xl p-6 max-w-sm mx-4 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn size={32} className="text-green-400" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">登录后运行代码</h3>
              <p className="text-gray-400 text-sm mb-6">
                登录后即可运行代码、保存文件、查看学习进度
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  继续编辑
                </button>
                <button
                  onClick={onLoginRequired}
                  className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
                >
                  去登录
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="h-10 bg-[#252526] border-t border-[#3c3c3c] flex items-center justify-center">
        <p className="text-gray-500 text-xs">
          登录后可运行代码、保存文件、同步学习进度
        </p>
      </div>
    </div>
  );
}
