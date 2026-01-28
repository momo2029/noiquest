import { useMemo } from 'react';
import { SkillUnit } from '../../types';
import KnowledgeNode from './KnowledgeNode';

interface KnowledgeMapProps {
  units: SkillUnit[];
  dependencies: { from: string; to: string }[];
  selectedUnitId: string | null;
  onSelectUnit: (unit: SkillUnit | null) => void;
}

// 获取单元的唯一标识符（优先使用 code）
const getUnitKey = (unit: SkillUnit): string => unit.code || unit.id;

export default function KnowledgeMap({
  units,
  dependencies,
  selectedUnitId,
  onSelectUnit,
}: KnowledgeMapProps) {
  // 按层级组织知识点（基于依赖关系）
  const layers = useMemo(() => {
    if (units.length === 0) return [];

    // 构建 code -> unit 的映射
    const unitByKey = new Map<string, SkillUnit>();
    units.forEach(u => unitByKey.set(getUnitKey(u), u));

    // 构建依赖图
    const dependsOn = new Map<string, Set<string>>();
    const dependedBy = new Map<string, Set<string>>();

    units.forEach(u => {
      const key = getUnitKey(u);
      dependsOn.set(key, new Set());
      dependedBy.set(key, new Set());
    });

    dependencies.forEach(dep => {
      // 只添加存在于当前单元列表中的依赖
      if (unitByKey.has(dep.from) && unitByKey.has(dep.to)) {
        dependsOn.get(dep.to)?.add(dep.from);
        dependedBy.get(dep.from)?.add(dep.to);
      }
    });

    // 拓扑排序分层
    const layers: SkillUnit[][] = [];
    const assigned = new Set<string>();

    while (assigned.size < units.length) {
      const layer: SkillUnit[] = [];

      units.forEach(unit => {
        const key = getUnitKey(unit);
        if (assigned.has(key)) return;

        // 检查所有依赖是否已分配
        const deps = dependsOn.get(key) || new Set();
        const allDepsAssigned = Array.from(deps).every(d => assigned.has(d));

        if (allDepsAssigned) {
          layer.push(unit);
        }
      });

      if (layer.length === 0) {
        // 防止死循环，把剩余的都放到最后一层
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
      <div className="max-w-4xl mx-auto">
        {/* 按层级渲染 */}
        {layers.map((layer, layerIndex) => (
          <div key={layerIndex} className="mb-6">
            {/* 层级标签 */}
            {layerIndex === 0 && (
              <div className="text-center mb-4">
                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                  入口知识点
                </span>
              </div>
            )}

            {/* 知识点网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {layer.map(unit => (
                <KnowledgeNode
                  key={unit.id}
                  unit={unit}
                  isSelected={unit.id === selectedUnitId}
                  onClick={() =>
                    onSelectUnit(unit.id === selectedUnitId ? null : unit)
                  }
                />
              ))}
            </div>

            {/* 连接线指示 */}
            {layerIndex < layers.length - 1 && (
              <div className="flex justify-center my-4">
                <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
