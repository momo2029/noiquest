import { TierInfo, ModuleInfo } from '../../types';
import { BarChart3, Target, TrendingUp } from 'lucide-react';

interface StatisticsPanelProps {
  tiers: TierInfo[];
  modules: ModuleInfo[];
  totalUnits: number;
  completedUnits: number;
}

export default function StatisticsPanel({
  tiers,
  modules,
  totalUnits,
  completedUnits,
}: StatisticsPanelProps) {
  const overallRate = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* 总体进度 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="text-cyan-400" size={20} />
          <h3 className="text-white font-bold">总体掌握度</h3>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">知识点掌握</span>
            <span className="text-white font-bold">
              {completedUnits} / {totalUnits}
            </span>
          </div>
          <div className="h-4 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${overallRate}%` }}
            />
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-cyan-400">{overallRate}%</span>
          </div>
        </div>
      </div>

      {/* 梯队进度 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="text-purple-400" size={20} />
          <h3 className="text-white font-bold">梯队进度</h3>
        </div>
        <div className="space-y-3">
          {tiers.map((tier) => (
            <div key={tier.id} className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">{tier.name}</span>
                <span className="text-xs text-gray-400">
                  {tier.completedUnits}/{tier.totalUnits}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${tier.completionRate}%`,
                    backgroundColor: tier.color,
                  }}
                />
              </div>
              <div className="text-right mt-1">
                <span className="text-xs" style={{ color: tier.color }}>
                  {tier.completionRate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 模块进度 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="text-green-400" size={20} />
          <h3 className="text-white font-bold">模块进度</h3>
        </div>
        <div className="space-y-2">
          {modules.map((mod) => (
            <div key={mod.id} className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{mod.icon}</span>
                <span className="text-white font-medium text-sm flex-1 truncate">
                  {mod.name}
                </span>
                <span className="text-xs text-gray-400">
                  {mod.completedUnits}/{mod.totalUnits}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${mod.completionRate}%`,
                    backgroundColor: mod.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
