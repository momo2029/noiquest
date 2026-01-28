import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { SkillUnit, TierInfo, ModuleInfo, Tier } from '../../types';
import TierSelector from '../SkillTree/TierSelector';
import ModuleSidebar from '../SkillTree/ModuleSidebar';
import GraphVisualization from './GraphVisualization';
import KnowledgeDetail from './KnowledgeDetail';
import StatisticsPanel from './StatisticsPanel';
import { GitBranch, Filter } from 'lucide-react';

interface KnowledgeGraphViewProps {
  onNavigateToSkillTree: () => void;
}

export default function KnowledgeGraphView({ onNavigateToSkillTree }: KnowledgeGraphViewProps) {
  // 数据状态
  const [allTiers, setAllTiers] = useState<TierInfo[]>([]);
  const [allModules, setAllModules] = useState<ModuleInfo[]>([]);
  const [allUnits, setAllUnits] = useState<SkillUnit[]>([]);
  const [allDependencies, setAllDependencies] = useState<{ from: string; to: string }[]>([]);

  // 筛选状态
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SkillUnit | null>(null);

  // 加载状态
  const [loading, setLoading] = useState(true);

  // 加载所有数据
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);

      // 获取所有梯队信息
      const tiersData = await api.getTiers();
      setAllTiers(tiersData.tiers);

      // 获取所有模块（不传 tier 参数获取全部）
      const modulesData = await api.getModules();
      setAllModules(modulesData.modules);

      // 获取所有知识点（不传参数获取全部）
      const skillTreeData = await api.getSkillTree();
      setAllUnits(skillTreeData.skillTree);
      setAllDependencies(skillTreeData.dependencies || []);
    } catch (error) {
      console.error('Failed to load knowledge graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 根据筛选条件过滤知识点
  const filteredUnits = useMemo(() => {
    let result = allUnits;

    if (selectedTier) {
      result = result.filter(u => u.tier === selectedTier);
    }

    if (selectedModuleId !== null) {
      result = result.filter(u => u.moduleId === selectedModuleId);
    }

    return result;
  }, [allUnits, selectedTier, selectedModuleId]);

  // 根据筛选条件过滤模块
  const filteredModules = useMemo(() => {
    if (!selectedTier) {
      return allModules;
    }

    // 获取当前梯队下有知识点的模块 ID
    const moduleIdsInTier = new Set(
      allUnits.filter(u => u.tier === selectedTier).map(u => u.moduleId)
    );

    return allModules.filter(m => moduleIdsInTier.has(m.id));
  }, [allModules, allUnits, selectedTier]);

  // 计算统计数据
  const stats = useMemo(() => {
    const totalUnits = filteredUnits.length;
    const completedUnits = filteredUnits.filter(u => u.completed).length;
    return { totalUnits, completedUnits };
  }, [filteredUnits]);

  // 处理梯队选择
  const handleTierSelect = (tier: Tier) => {
    if (selectedTier === tier) {
      setSelectedTier(null);
    } else {
      setSelectedTier(tier);
    }
    setSelectedModuleId(null);
    setSelectedUnit(null);
  };

  // 处理模块选择
  const handleModuleSelect = (moduleId: number | null) => {
    setSelectedModuleId(moduleId);
    setSelectedUnit(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">加载知识图谱...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#1a1a2e] to-[#16213e] overflow-hidden">
      {/* 顶部：标题和筛选器 */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <GitBranch size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">NOI 知识图谱</h1>
              <p className="text-sm text-gray-400">
                共 {stats.totalUnits} 个知识点，已掌握 {stats.completedUnits} 个
                {stats.totalUnits > 0 && (
                  <span className="text-cyan-400 ml-1">
                    ({Math.round((stats.completedUnits / stats.totalUnits) * 100)}%)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* 梯队筛选器 */}
          <div className="flex items-center gap-3">
            {selectedTier && (
              <button
                onClick={() => {
                  setSelectedTier(null);
                  setSelectedModuleId(null);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-gray-300 transition-colors"
              >
                <Filter size={14} />
                清除筛选
              </button>
            )}
            <TierSelector
              tiers={allTiers.map(t => ({
                ...t,
                unlocked: true, // 在知识图谱中所有梯队都可查看
              }))}
              selectedTier={selectedTier || 'CSP_J'}
              onSelectTier={handleTierSelect}
            />
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：模块导航 */}
        <ModuleSidebar
          modules={filteredModules}
          selectedModuleId={selectedModuleId}
          onSelectModule={handleModuleSelect}
        />

        {/* 中间：知识点图谱 */}
        <GraphVisualization
          units={filteredUnits}
          dependencies={allDependencies}
          selectedUnitId={selectedUnit?.id || null}
          onSelectUnit={setSelectedUnit}
        />

        {/* 右侧面板 */}
        <div className="w-80 bg-[#1e1e2e] border-l border-white/10 flex flex-col">
          {selectedUnit ? (
            <KnowledgeDetail
              unit={selectedUnit}
              onNavigateToSkillTree={onNavigateToSkillTree}
            />
          ) : (
            <StatisticsPanel
              tiers={allTiers}
              modules={allModules}
              totalUnits={allUnits.length}
              completedUnits={allUnits.filter(u => u.completed).length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
