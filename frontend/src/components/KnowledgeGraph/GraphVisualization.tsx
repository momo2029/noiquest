import { useMemo } from 'react';
import { SkillUnit } from '../../types';
import { Lock, Check, Crown, Star } from 'lucide-react';

interface GraphVisualizationProps {
  units: SkillUnit[];
  dependencies: { from: string; to: string }[];
  selectedUnitId: string | null;
  onSelectUnit: (unit: SkillUnit | null) => void;
}

const getUnitKey = (unit: SkillUnit): string => unit.code || unit.id;

export default function GraphVisualization({
  units,
  dependencies,
  selectedUnitId,
  onSelectUnit,
}: GraphVisualizationProps) {
  // 按层级组织知识点（基于依赖关系）
  const layers = useMemo(() => {
    if (units.length === 0) return [];

    const unitByKey = new Map<string, SkillUnit>();
    units.forEach(u => unitByKey.set(getUnitKey(u), u));

    const dependsOn = new Map<string, Set<string>>();
    const dependedBy = new Map<string, Set<string>>();

    units.forEach(u => {
      const key = getUnitKey(u);
      dependsOn.set(key, new Set());
      dependedBy.set(key, new Set());
    });

    dependencies.forEach(dep => {
      if (unitByKey.has(dep.from) && unitByKey.has(dep.to)) {
        dependsOn.get(dep.to)?.add(dep.from);
        dependedBy.get(dep.from)?.add(dep.to);
      }
    });

    const layers: SkillUnit[][] = [];
    const assigned = new Set<string>();

    while (assigned.size < units.length) {
      const layer: SkillUnit[] = [];

      units.forEach(unit => {
        const key = getUnitKey(unit);
        if (assigned.has(key)) return;

        const deps = dependsOn.get(key) || new Set();
        const allDepsAssigned = Array.from(deps).every(d => assigned.has(d));

        if (allDepsAssigned) {
          layer.push(unit);
        }
      });

      if (layer.length === 0) {
        units.forEach(unit => {
          const key = getUnitKey(unit);
          if (!assigned.has(key)) {
            layer.push(unit);
          }
        });
      }

      layer.forEach(u => assigned.add(getUnitKey(u)));
      layers.push(layer);
    }

    return layers;
  }, [units, dependencies]);

  if (units.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>该分类下暂无知识点</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        {layers.map((layer, layerIndex) => (
          <div key={layerIndex} className="mb-6">
            {layerIndex === 0 && (
              <div className="text-center mb-4">
                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                  基础知识点
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {layer.map(unit => {
                const isLocked = !unit.unlocked;
                const isCompleted = unit.completed;
                const isSelected = unit.id === selectedUnitId;
                const hasProgress = unit.sessionsCompleted > 0;

                return (
                  <button
                    key={unit.id}
                    onClick={() => onSelectUnit(unit.id === selectedUnitId ? null : unit)}
                    className={`
                      relative p-3 rounded-xl transition-all text-left
                      ${isLocked
                        ? 'bg-gray-800/30 opacity-50'
                        : isSelected
                          ? 'bg-white/15 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/20'
                          : isCompleted
                            ? 'bg-green-900/30 hover:bg-green-900/40 ring-1 ring-green-500/30'
                            : hasProgress
                              ? 'bg-blue-900/30 hover:bg-blue-900/40'
                              : 'bg-white/5 hover:bg-white/10'
                      }
                    `}
                  >
                    {/* 编号和核心度 */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-500 font-mono truncate max-w-[60%]">
                        {unit.code}
                      </span>
                      {unit.coreLevel > 0 && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: Math.min(unit.coreLevel, 3) }).map((_, i) => (
                            <Star key={i} size={8} className="fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 图标和标题 */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0
                          ${isLocked ? 'bg-gray-700' : 'bg-white/10'}
                        `}
                      >
                        {isLocked ? (
                          <Lock size={14} className="text-gray-500" />
                        ) : isCompleted ? (
                          unit.crownLevel > 0 ? (
                            <Crown size={14} className="text-yellow-400" />
                          ) : (
                            <Check size={14} className="text-green-400" />
                          )
                        ) : (
                          <span className="text-sm">{unit.icon}</span>
                        )}
                      </div>

                      <h4
                        className={`
                          font-medium text-xs truncate
                          ${isLocked ? 'text-gray-500' : 'text-white'}
                        `}
                      >
                        {unit.title}
                      </h4>
                    </div>

                    {/* 进度指示器 */}
                    {!isLocked && unit.totalSessions > 0 && (
                      <div className="mt-2">
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{
                              width: `${Math.round((unit.sessionsCompleted / unit.totalSessions) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 完成标记 */}
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {layerIndex < layers.length - 1 && (
              <div className="flex justify-center my-4">
                <div className="w-px h-6 bg-gradient-to-b from-white/20 to-transparent" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
