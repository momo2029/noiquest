import { KnowledgeMastery } from '../../types';

interface WeaknessChartProps {
  mastery: KnowledgeMastery[];
}

export default function WeaknessChart({ mastery }: WeaknessChartProps) {
  // 按掌握度排序
  const sortedMastery = [...mastery].sort((a, b) => a.masteryLevel - b.masteryLevel);

  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    if (level >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMasteryLabel = (level: number) => {
    if (level >= 80) return '熟练';
    if (level >= 60) return '掌握';
    if (level >= 40) return '一般';
    return '薄弱';
  };

  if (mastery.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/50">暂无掌握度数据</p>
        <p className="text-white/30 text-sm mt-1">完成更多练习后将显示掌握度分析</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-white font-bold mb-4">知识点掌握度</h3>

      {/* 图例 */}
      <div className="flex gap-4 mb-6">
        {[
          { color: 'bg-green-500', label: '熟练 (80%+)' },
          { color: 'bg-yellow-500', label: '掌握 (60-79%)' },
          { color: 'bg-orange-500', label: '一般 (40-59%)' },
          { color: 'bg-red-500', label: '薄弱 (<40%)' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            <span className="text-white/50 text-xs">{item.label}</span>
          </div>
        ))}
      </div>

      {/* 掌握度列表 */}
      <div className="space-y-4">
        {sortedMastery.map(item => (
          <div key={item.key} className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white font-medium">{item.key}</p>
                <p className="text-white/50 text-xs">
                  {item.type === 'category' ? '分类' : '单元'} ·
                  复习 {item.reviewCount} 次 ·
                  正确率 {item.accuracy}%
                </p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  item.masteryLevel >= 80 ? 'text-green-400' :
                  item.masteryLevel >= 60 ? 'text-yellow-400' :
                  item.masteryLevel >= 40 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {item.masteryLevel}%
                </p>
                <p className="text-white/50 text-xs">{getMasteryLabel(item.masteryLevel)}</p>
              </div>
            </div>

            {/* 进度条 */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getMasteryColor(item.masteryLevel)}`}
                style={{ width: `${item.masteryLevel}%` }}
              />
            </div>

            {/* 下次复习时间 */}
            {item.nextReviewAt && (
              <p className="text-white/30 text-xs mt-2">
                下次复习: {new Date(item.nextReviewAt).toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 统计摘要 */}
      <div className="mt-6 p-4 bg-blue-500/10 rounded-xl">
        <h4 className="text-blue-400 font-medium mb-2">统计摘要</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">
              {Math.round(mastery.reduce((sum, m) => sum + m.masteryLevel, 0) / mastery.length) || 0}%
            </p>
            <p className="text-white/50 text-xs">平均掌握度</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {mastery.filter(m => m.masteryLevel >= 60).length}
            </p>
            <p className="text-white/50 text-xs">已掌握</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {mastery.filter(m => m.masteryLevel < 40).length}
            </p>
            <p className="text-white/50 text-xs">需加强</p>
          </div>
        </div>
      </div>
    </div>
  );
}
