import { useState, useEffect } from 'react';
import { X, Lightbulb, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { Exercise } from '../../types';

interface AIHintModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export default function AIHintModal({ exercise, onClose }: AIHintModalProps) {
  const [hint, setHint] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchHint = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getAIHint(exercise.id);
      setHint(result.hint);
    } catch (err: any) {
      setError(err.message || '获取提示失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 首次加载时获取提示
  useEffect(() => {
    fetchHint();
  }, [exercise.id]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-[#252536] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Lightbulb className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">AI 小助手</h3>
              <p className="text-white/80 text-sm">让我来帮你思考这道题</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mb-4" />
              <p className="text-white/70">AI 正在思考中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchHint}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                重试
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 题目信息 */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white/50 text-sm mb-2">当前题目</h4>
                <p className="text-white font-medium">{exercise.title}</p>
              </div>

              {/* AI 提示 */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
                <h4 className="text-yellow-400 text-sm mb-3 flex items-center gap-2">
                  <Lightbulb size={16} />
                  思考提示
                </h4>
                <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {hint}
                </div>
              </div>

              {/* 鼓励语 */}
              <p className="text-white/50 text-sm text-center">
                加油！相信你一定能想出来的！
              </p>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            我知道了，继续答题
          </button>
        </div>
      </div>
    </div>
  );
}
