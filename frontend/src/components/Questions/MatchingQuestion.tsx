import { useState } from 'react';
import { Exercise, MatchingData } from '../../types';
import { Send, Link, X } from 'lucide-react';

interface MatchingQuestionProps {
  exercise: Exercise;
  onSubmit: (answer: [string, string][]) => void;
  disabled?: boolean;
}

// 数据库格式
interface DBMatchingData {
  leftItems: string[];
  rightItems: string[];
  correctPairs: [number, number][];
  explanation?: string;
}

// 转换数据库格式到前端格式
function normalizeMatchingData(raw: MatchingData | DBMatchingData): MatchingData | null {
  // 已经是前端格式
  if ('left' in raw && 'right' in raw && Array.isArray(raw.left)) {
    return raw as MatchingData;
  }
  // 数据库格式，需要转换
  const dbData = raw as DBMatchingData;
  if (!dbData.leftItems || !dbData.rightItems) return null;

  return {
    left: dbData.leftItems.map((text, i) => ({ id: String(i), text })),
    right: dbData.rightItems.map((text, i) => ({ id: String(i), text })),
    pairs: dbData.correctPairs?.map(([l, r]) => [String(l), String(r)] as [string, string]) || [],
  };
}

export default function MatchingQuestion({ exercise, onSubmit, disabled }: MatchingQuestionProps) {
  const rawData = exercise.questionData as MatchingData | DBMatchingData;
  const data = normalizeMatchingData(rawData);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<[string, string][]>([]);

  if (!data) return null;

  const handleLeftClick = (id: string) => {
    if (disabled) return;
    // 检查是否已配对
    if (pairs.some(p => p[0] === id)) return;
    setSelectedLeft(selectedLeft === id ? null : id);
  };

  const handleRightClick = (id: string) => {
    if (disabled || !selectedLeft) return;

    // 添加配对（允许多对一，右侧项可重复选择）
    setPairs([...pairs, [selectedLeft, id]]);
    setSelectedLeft(null);
  };

  const removePair = (leftId: string) => {
    if (disabled) return;
    setPairs(pairs.filter(p => p[0] !== leftId));
  };

  const getPairedRight = (leftId: string) => {
    const pair = pairs.find(p => p[0] === leftId);
    return pair ? pair[1] : null;
  };

  const handleSubmit = () => {
    onSubmit(pairs);
  };

  // 获取配对颜色
  const pairColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
  const getPairColor = (leftId: string) => {
    const index = pairs.findIndex(p => p[0] === leftId);
    return index >= 0 ? pairColors[index % pairColors.length] : '';
  };

  return (
    <div>
      {/* 配对区域 */}
      <div className="flex gap-8 mb-6">
        {/* 左侧列表 */}
        <div className="flex-1 space-y-3">
          <h4 className="text-white/50 text-sm mb-2">概念</h4>
          {data.left.map((item) => {
            const pairedRightId = getPairedRight(item.id);
            const pairedRight = pairedRightId ? data.right.find(r => r.id === pairedRightId) : null;
            const color = getPairColor(item.id);

            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => handleLeftClick(item.id)}
                  disabled={disabled || !!pairedRightId}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all
                    ${selectedLeft === item.id
                      ? 'border-blue-500 bg-blue-500/20'
                      : pairedRightId
                        ? `border-transparent ${color}/20`
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }
                    ${disabled ? 'cursor-not-allowed' : pairedRightId ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-white">{item.text}</span>
                </button>

                {/* 已配对显示 */}
                {pairedRight && (
                  <div className={`mt-1 p-2 rounded-lg ${color}/30 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Link size={14} className="text-white/50" />
                      <span className="text-white/80 text-sm">{pairedRight.text}</span>
                    </div>
                    {!disabled && (
                      <button
                        onClick={() => removePair(item.id)}
                        className="p-1 text-white/50 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 右侧列表 */}
        <div className="flex-1 space-y-3">
          <h4 className="text-white/50 text-sm mb-2">代码</h4>
          {data.right.map((item) => {
            return (
              <button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                disabled={disabled || !selectedLeft}
                className={`
                  w-full p-4 rounded-xl border-2 text-left transition-all font-mono text-sm
                  ${selectedLeft
                    ? 'border-white/30 bg-white/10 hover:border-blue-500 cursor-pointer'
                    : 'border-white/10 bg-white/5'
                  }
                  ${disabled ? 'cursor-not-allowed' : ''}
                `}
              >
                <span className="text-gray-300">{item.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 提示 */}
      {selectedLeft && (
        <p className="text-blue-400 text-sm text-center mb-4">
          请点击右侧对应的代码进行配对
        </p>
      )}

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={disabled || pairs.length < data.left.length}
        className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Send size={20} />
        提交答案
      </button>
    </div>
  );
}
