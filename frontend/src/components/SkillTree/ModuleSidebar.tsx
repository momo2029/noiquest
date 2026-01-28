import { ModuleInfo } from '../../types';

interface ModuleSidebarProps {
  modules: ModuleInfo[];
  selectedModuleId: number | null;
  onSelectModule: (moduleId: number | null) => void;
}

export default function ModuleSidebar({
  modules,
  selectedModuleId,
  onSelectModule,
}: ModuleSidebarProps) {
  return (
    <div className="w-56 bg-[#1e1e2e] border-r border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-bold text-sm">知识模块</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* 全部模块选项 */}
        <button
          onClick={() => onSelectModule(null)}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-all
            ${selectedModuleId === null
              ? 'bg-white/10 text-white'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }
          `}
        >
          <span className="text-lg">📚</span>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">全部</div>
          </div>
        </button>

        {/* 各模块 */}
        {modules.map((mod) => {
          const isSelected = mod.id === selectedModuleId;

          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-all
                ${isSelected
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className="text-lg">{mod.icon}</span>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium truncate">{mod.name}</div>
                {mod.totalUnits > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${mod.completionRate}%`,
                          backgroundColor: mod.color,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {mod.completedUnits}/{mod.totalUnits}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
