import { exercises, achievements, calculateLevel } from '../../data/exercises';
import { Student } from '../../types';
import { Trophy, Flame, Target, Star, Lock, CheckCircle, Zap } from 'lucide-react';

interface ProgressTrackerProps {
  completedIds: string[];
  student?: Student;
}

export default function ProgressTracker({ completedIds, student }: ProgressTrackerProps) {
  const totalExercises = exercises.length;
  const completedCount = completedIds.length;
  const percentage = Math.round((completedCount / totalExercises) * 100);

  const levelInfo = student ? calculateLevel(student.totalXp) : { level: 1, currentXp: 0, nextLevelXp: 50 };

  // 按难度统计
  const difficultyStats = exercises.reduce((acc, ex) => {
    if (!acc[ex.difficulty]) {
      acc[ex.difficulty] = { total: 0, completed: 0 };
    }
    acc[ex.difficulty].total++;
    if (completedIds.includes(ex.id)) {
      acc[ex.difficulty].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const difficultyLabels = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500'
  };

  // 检查成就是否解锁
  const checkAchievement = (condition: { type: string; value: number }): boolean => {
    switch (condition.type) {
      case 'exercisesCompleted':
        return completedCount >= condition.value;
      case 'completeAll':
        return completedCount >= totalExercises;
      case 'streak':
        return (student?.streak || 0) >= condition.value;
      case 'level':
        return levelInfo.level >= condition.value;
      case 'completeEasyMedium':
        return (difficultyStats.easy?.completed || 0) === (difficultyStats.easy?.total || 0) &&
               (difficultyStats.medium?.completed || 0) === (difficultyStats.medium?.total || 0);
      default:
        return false;
    }
  };

  return (
    <div className="h-full bg-[#131f24] text-white p-6 overflow-y-auto">
      {/* 个人信息卡片 */}
      {student && (
        <div className="bg-gradient-to-r from-[#007acc] to-[#005a9e] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
              {student.avatar || '🦊'}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{student.name}</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-black text-yellow-900">{levelInfo.level}</span>
                  </div>
                  <span className="text-white/80 text-sm">级</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="text-orange-300" size={20} />
                  <span className="text-white font-bold">{student.streak} 天</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="text-yellow-300" size={20} />
                  <span className="text-white font-bold">{student.totalXp} XP</span>
                </div>
              </div>
              {/* 经验条 */}
              <div className="mt-3">
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${(levelInfo.currentXp / levelInfo.nextLevelXp) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-white/70 mt-1">
                  距离 {levelInfo.level + 1} 级还需 {levelInfo.nextLevelXp - levelInfo.currentXp} XP
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e2d34] rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#007acc]">{completedCount}</div>
          <div className="text-gray-400 text-sm">已完成题目</div>
        </div>
        <div className="bg-[#1e2d34] rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#1cb0f6]">{percentage}%</div>
          <div className="text-gray-400 text-sm">完成进度</div>
        </div>
        <div className="bg-[#1e2d34] rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#ff9600]">{student?.totalXp || 0}</div>
          <div className="text-gray-400 text-sm">总经验值</div>
        </div>
      </div>

      {/* 总体进度 */}
      <div className="bg-[#1e2d34] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="text-[#007acc]" size={20} />
              <span className="font-bold">学习进度</span>
            </div>
            <span className="text-[#007acc] font-bold">{completedCount} / {totalExercises}</span>
          </div>
          <div className="h-4 bg-[#131f24] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#007acc] to-[#005a9e] transition-all duration-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
      </div>

      {/* 按难度统计 */}
      <div className="bg-[#1e2d34] rounded-xl p-5 mb-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Star className="text-yellow-400" size={20} />
          难度分布
        </h3>
        <div className="space-y-3">
          {(['easy', 'medium', 'hard'] as const).map(diff => {
            const stats = difficultyStats[diff] || { total: 0, completed: 0 };
            const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            return (
              <div key={diff}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded ${difficultyColors[diff]}`} />
                    {difficultyLabels[diff]}
                  </span>
                  <span className="text-gray-400">
                    {stats.completed} / {stats.total}
                  </span>
                </div>
                <div className="h-2 bg-[#131f24] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${difficultyColors[diff]} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 成就系统 */}
      <div className="bg-[#1e2d34] rounded-xl p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Trophy className="text-yellow-400" size={20} />
          成就徽章
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map(achievement => {
            const unlocked = checkAchievement(achievement.condition);
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  unlocked
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-gray-800/30 border-gray-700/30 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-3xl ${unlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{achievement.name}</span>
                      {unlocked ? (
                        <CheckCircle size={14} className="text-[#007acc]" />
                      ) : (
                        <Lock size={14} className="text-gray-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{achievement.description}</p>
                    <p className="text-xs text-yellow-400 mt-1">+{achievement.reward?.xp || 0} XP</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
