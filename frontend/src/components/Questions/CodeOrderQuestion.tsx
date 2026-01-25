import { useState } from 'react';
import { Exercise, CodeOrderData } from '../../types';
import { GripVertical, Send } from 'lucide-react';

interface CodeOrderQuestionProps {
  exercise: Exercise;
  onSubmit: (answer: string[]) => void;
  disabled?: boolean;
}

export default function CodeOrderQuestion({ exercise, onSubmit, disabled }: CodeOrderQuestionProps) {
  const data = exercise.questionData as CodeOrderData;
  const [orderedLines, setOrderedLines] = useState<{ id: string; code: string }[]>(() => {
    // 随机打乱顺序
    const lines = [...(data?.lines || [])];
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    return lines;
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (!data) return null;

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newLines = [...orderedLines];
    const draggedItem = newLines[draggedIndex];
    newLines.splice(draggedIndex, 1);
    newLines.splice(index, 0, draggedItem);
    setOrderedLines(newLines);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= orderedLines.length) return;

    const newLines = [...orderedLines];
    [newLines[fromIndex], newLines[toIndex]] = [newLines[toIndex], newLines[fromIndex]];
    setOrderedLines(newLines);
  };

  const handleSubmit = () => {
    onSubmit(orderedLines.map(line => line.id));
  };

  return (
    <div>
      {/* 说明 */}
      <p className="text-white/60 text-sm mb-4">{data.description}</p>

      {/* 代码行列表 */}
      <div className="space-y-2 mb-6">
        {orderedLines.map((line, index) => (
          <div
            key={line.id}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center gap-3 p-3 bg-[#1e1e1e] rounded-xl border-2 transition-all
              ${draggedIndex === index ? 'border-blue-500 opacity-50' : 'border-transparent'}
              ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
            `}
          >
            {/* 拖拽手柄 */}
            <div className="text-gray-500">
              <GripVertical size={20} />
            </div>

            {/* 序号 */}
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-sm">
              {index + 1}
            </div>

            {/* 代码 */}
            <code className="flex-1 text-gray-300 font-mono text-sm">{line.code}</code>

            {/* 上下移动按钮 */}
            {!disabled && (
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === orderedLines.length - 1}
                  className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ▼
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Send size={20} />
        提交答案
      </button>
    </div>
  );
}
