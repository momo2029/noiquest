import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MistakeRecord } from '../../types';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function MistakeBook() {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unreviewed' | 'reviewed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadMistakes();
  }, [filter, page]);

  const loadMistakes = async () => {
    try {
      setLoading(true);
      const reviewed = filter === 'all' ? undefined : filter === 'reviewed';
      const result = await api.getMistakes({ reviewed, page, limit: 10 });
      setMistakes(result.mistakes);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load mistakes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (mistakeId: string) => {
    try {
      await api.markMistakeReviewed(mistakeId);
      loadMistakes();
    } catch (error) {
      console.error('Failed to mark as reviewed:', error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading && mistakes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-white/50">加载错题...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 筛选 */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'all', label: '全部' },
          { id: 'unreviewed', label: '未复习' },
          { id: 'reviewed', label: '已复习' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => { setFilter(item.id as any); setPage(1); }}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${filter === item.id
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 错题列表 */}
      {mistakes.length > 0 ? (
        <div className="space-y-3">
          {mistakes.map(mistake => (
            <div
              key={mistake.id}
              className={`bg-white/5 rounded-xl overflow-hidden ${mistake.reviewed ? 'opacity-60' : ''}`}
            >
              {/* 头部 */}
              <button
                onClick={() => toggleExpand(mistake.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  {/* 状态图标 */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${mistake.reviewed ? 'bg-green-500/20' : 'bg-red-500/20'}
                  `}>
                    {mistake.reviewed ? (
                      <CheckCircle size={16} className="text-green-400" />
                    ) : (
                      <span className="text-red-400 font-bold text-sm">{mistake.mistakeCount}</span>
                    )}
                  </div>

                  {/* 题目信息 */}
                  <div>
                    <p className="text-white font-medium">{mistake.exercise.title}</p>
                    <p className="text-white/50 text-sm">
                      {mistake.exercise.category} · {mistake.exercise.type}
                    </p>
                  </div>
                </div>

                {/* 展开图标 */}
                {expandedId === mistake.id ? (
                  <ChevronUp className="text-white/50" size={20} />
                ) : (
                  <ChevronDown className="text-white/50" size={20} />
                )}
              </button>

              {/* 展开内容 */}
              {expandedId === mistake.id && (
                <div className="px-4 pb-4 border-t border-white/10 pt-4">
                  {/* 你的答案 */}
                  <div className="mb-3">
                    <p className="text-white/50 text-sm mb-1">你的答案：</p>
                    <div className="bg-red-500/10 rounded-lg p-3">
                      <code className="text-red-300 text-sm">
                        {typeof mistake.userAnswer === 'string'
                          ? mistake.userAnswer
                          : JSON.stringify(mistake.userAnswer, null, 2)}
                      </code>
                    </div>
                  </div>

                  {/* 正确答案 */}
                  <div className="mb-4">
                    <p className="text-white/50 text-sm mb-1">正确答案：</p>
                    <div className="bg-green-500/10 rounded-lg p-3">
                      <code className="text-green-300 text-sm">
                        {typeof mistake.correctAnswer === 'string'
                          ? mistake.correctAnswer
                          : JSON.stringify(mistake.correctAnswer, null, 2)}
                      </code>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  {!mistake.reviewed && (
                    <button
                      onClick={() => handleMarkReviewed(mistake.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      标记为已复习
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/50 text-center py-8">
          {filter === 'unreviewed' ? '没有未复习的错题' : '暂无错题记录'}
        </p>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-white/50 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
