import { Course, CourseSession } from '../../types';
import { Check, Lock, Crown, Star, Play, ChevronRight } from 'lucide-react';

interface CourseDetailPanelProps {
  course: Course;
  onStartSession: (sessionId: string) => void;
}

export default function CourseDetailPanel({ course, onStartSession }: CourseDetailPanelProps) {
  // 找到当前应该学习的课时
  const currentSession = course.sessions.find(s => !s.completed);
  const allCompleted = course.sessions.every(s => s.completed);

  // 渲染核心度星星
  const renderCoreLevel = (level: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            className={i < level ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
          />
        ))}
      </div>
    );
  };

  // 渲染课时状态图标
  const renderSessionIcon = (session: CourseSession, index: number) => {
    if (session.completed) {
      if (session.perfectRun) {
        return <Crown size={16} className="text-yellow-400" />;
      }
      return <Check size={16} className="text-green-400" />;
    }
    if (currentSession?.id === session.id) {
      return <Play size={16} className="text-blue-400" />;
    }
    if (!course.unlocked) {
      return <Lock size={14} className="text-gray-500" />;
    }
    return <span className="text-xs text-gray-500">{index + 1}</span>;
  };

  return (
    <div>
      {/* 课程标题 */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500 font-mono">{course.code}</span>
          {course.crownLevel > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: course.crownLevel }).map((_, i) => (
                <Crown key={i} size={12} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold text-white">
          第{course.orderIndex}节：{course.title}
        </h3>
        {course.description && (
          <p className="text-sm text-gray-400 mt-1">{course.description}</p>
        )}
      </div>

      {/* 学习目标 */}
      {course.objectives && course.objectives.length > 0 && (
        <div className="p-4 border-b border-white/10">
          <h4 className="text-sm font-medium text-gray-300 mb-2">📖 学习目标</h4>
          <ul className="space-y-1">
            {course.objectives.map((obj, i) => (
              <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 包含的知识点 */}
      {course.units && course.units.length > 0 && (
        <div className="p-4 border-b border-white/10">
          <h4 className="text-sm font-medium text-gray-300 mb-2">🏷️ 包含知识点</h4>
          <div className="flex flex-wrap gap-2">
            {course.units.map(unit => (
              <div
                key={unit.id}
                className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 flex items-center gap-1"
              >
                <span className="text-gray-500">{unit.code}</span>
                {unit.title}
                {unit.coreLevel && renderCoreLevel(unit.coreLevel)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 课时列表 */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">📝 课时列表</h4>
        <div className="space-y-2">
          {course.sessions.map((session, index) => {
            const isCurrentSession = currentSession?.id === session.id;
            // 课时锁定逻辑：课程未解锁，或者前面有未完成的课时
            const hasPreviousIncomplete = index > 0 && course.sessions.slice(0, index).some(s => !s.completed);
            const isLocked = !course.unlocked || hasPreviousIncomplete;
            const canStart = course.unlocked && !isLocked;

            return (
              <div
                key={session.id}
                className={`
                  p-3 rounded-lg transition-all
                  ${session.completed
                    ? 'bg-green-900/20 border border-green-500/30'
                    : isCurrentSession
                      ? 'bg-blue-900/30 border border-blue-500/50'
                      : 'bg-white/5 border border-white/10'
                  }
                  ${canStart && !session.completed ? 'cursor-pointer hover:bg-white/10' : ''}
                `}
                onClick={() => canStart && !session.completed && onStartSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${session.completed
                          ? 'bg-green-500/20'
                          : isCurrentSession
                            ? 'bg-blue-500/20'
                            : 'bg-white/10'
                        }
                      `}
                    >
                      {renderSessionIcon(session, index)}
                    </div>
                    <div>
                      <p
                        className={`
                          text-sm font-medium
                          ${session.completed ? 'text-green-300' : 'text-white'}
                        `}
                      >
                        {index + 1}. {session.title}
                      </p>
                      {session.description && (
                        <p className="text-xs text-gray-500">{session.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-yellow-400">+{session.xpReward} XP</span>
                    {canStart && !session.completed && (
                      <ChevronRight size={16} className="text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 开始学习按钮 */}
      <div className="p-4 pt-2">
        {!course.unlocked ? (
          <button
            disabled
            className="w-full py-3 bg-gray-700 text-gray-400 rounded-xl font-medium cursor-not-allowed"
          >
            🔒 完成前置课程后解锁
          </button>
        ) : allCompleted ? (
          <button
            onClick={() => course.sessions[0] && onStartSession(course.sessions[0].id)}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
          >
            🔄 再次练习
          </button>
        ) : currentSession ? (
          <button
            onClick={() => onStartSession(currentSession.id)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            ▶️ 继续学习
          </button>
        ) : (
          <button
            onClick={() => course.sessions[0] && onStartSession(course.sessions[0].id)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            ▶️ 开始学习
          </button>
        )}
      </div>
    </div>
  );
}
