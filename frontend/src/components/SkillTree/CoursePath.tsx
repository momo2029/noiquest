import { useMemo } from 'react';
import { Course, Tier } from '../../types';
import CourseNode from './CourseNode';

interface CoursePathProps {
  courses: Course[];
  dependencies: { from: string; to: string }[];  // 保留用于未来绘制连线
  selectedCourseId: string | null;
  onSelectCourse: (course: Course | null) => void;
}

// 梯队配置
const TIER_CONFIG: Record<Tier, { name: string; color: string }> = {
  CSP_J: { name: 'CSP-J 入门篇', color: '#22c55e' },
  CSP_S: { name: 'CSP-S 进阶篇', color: '#3b82f6' },
  PROVINCIAL: { name: '省选/NOI', color: '#a855f7' },
  IOI: { name: 'IOI 大师篇', color: '#ef4444' },
};

export default function CoursePath({
  courses,
  dependencies: _dependencies,  // 前缀下划线表示暂未使用
  selectedCourseId,
  onSelectCourse,
}: CoursePathProps) {
  // 按梯队和行分组课程
  const coursesByTier = useMemo(() => {
    const grouped: Record<Tier, Course[][]> = {
      CSP_J: [],
      CSP_S: [],
      PROVINCIAL: [],
      IOI: [],
    };

    // 按梯队分组
    const tierCourses: Record<Tier, Course[]> = {
      CSP_J: [],
      CSP_S: [],
      PROVINCIAL: [],
      IOI: [],
    };

    courses.forEach(course => {
      tierCourses[course.tier].push(course);
    });

    // 每个梯队按orderIndex排序，然后每3个一行
    Object.entries(tierCourses).forEach(([tier, tierCourseList]) => {
      const sorted = tierCourseList.sort((a, b) => a.orderIndex - b.orderIndex);
      const rows: Course[][] = [];
      for (let i = 0; i < sorted.length; i += 3) {
        rows.push(sorted.slice(i, i + 3));
      }
      grouped[tier as Tier] = rows;
    });

    return grouped;
  }, [courses]);

  // 检查梯队是否解锁
  const isTierUnlocked = (tier: Tier): boolean => {
    const tierCourses = courses.filter(c => c.tier === tier);
    if (tierCourses.length === 0) return false;
    // 如果有任何一个课程解锁，则梯队解锁
    return tierCourses.some(c => c.unlocked);
  };

  // 计算梯队完成率
  const getTierProgress = (tier: Tier): { completed: number; total: number } => {
    const tierCourses = courses.filter(c => c.tier === tier);
    const completed = tierCourses.filter(c => c.completed).length;
    return { completed, total: tierCourses.length };
  };

  if (courses.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>该模块暂无课程</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* 按梯队渲染 */}
        {(Object.keys(TIER_CONFIG) as Tier[]).map(tier => {
          const rows = coursesByTier[tier];
          if (rows.length === 0) return null;

          const unlocked = isTierUnlocked(tier);
          const progress = getTierProgress(tier);
          const config = TIER_CONFIG[tier];

          return (
            <div key={tier} className="mb-8">
              {/* 梯队分隔线 */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium
                    ${unlocked ? 'bg-white/10 text-white' : 'bg-gray-800/50 text-gray-500'}
                  `}
                  style={{ borderColor: unlocked ? config.color : undefined }}
                >
                  {!unlocked && '🔒 '}
                  {config.name}
                  {unlocked && (
                    <span className="ml-2 text-gray-400">
                      {progress.completed}/{progress.total}
                    </span>
                  )}
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              {/* 课程网格 */}
              <div className="space-y-6">
                {rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="relative">
                    {/* 课程行 */}
                    <div className="flex justify-center gap-6">
                      {row.map(course => (
                        <CourseNode
                          key={course.id}
                          course={course}
                          isSelected={course.id === selectedCourseId}
                          onClick={() =>
                            onSelectCourse(course.id === selectedCourseId ? null : course)
                          }
                        />
                      ))}
                    </div>

                    {/* 连接线到下一行 */}
                    {rowIndex < rows.length - 1 && (
                      <div className="flex justify-center mt-4">
                        <div className="w-px h-6 bg-gradient-to-b from-white/30 to-white/10" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
