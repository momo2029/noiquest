import { useState } from 'react';
import { Student, Assignment } from '../../types';
import { exercises } from '../../data/exercises';
import { Users, BookOpen, ClipboardList, TrendingUp } from 'lucide-react';

interface DashboardProps {
  students: Student[];
  assignments: Assignment[];
}

export default function Dashboard({ students, assignments }: DashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // 统计数据
  const totalStudents = students.length;
  const totalAssignments = assignments.length;
  const totalExercises = exercises.length;

  // 计算平均完成率
  const avgCompletion = students.length > 0
    ? Math.round(
        students.reduce((sum, s) => sum + (s.progress.filter(p => p.completed).length / totalExercises) * 100, 0) / students.length
      )
    : 0;

  // 获取最近活跃的学生
  const recentActiveStudents = [...students]
    .sort((a, b) => {
      const aLatest = a.progress.reduce((max, p) => {
        const time = p.completedAt ? new Date(p.completedAt).getTime() : 0;
        return time > max ? time : max;
      }, 0);
      const bLatest = b.progress.reduce((max, p) => {
        const time = p.completedAt ? new Date(p.completedAt).getTime() : 0;
        return time > max ? time : max;
      }, 0);
      return bLatest - aLatest;
    })
    .slice(0, 5);

  return (
    <div className="h-full bg-gray-900 text-white p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">教师仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">学生总数</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-600 rounded-lg">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">题目总数</p>
              <p className="text-2xl font-bold">{totalExercises}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600 rounded-lg">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">作业数量</p>
              <p className="text-2xl font-bold">{totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">平均完成率</p>
              <p className="text-2xl font-bold">{avgCompletion}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 最近活跃学生 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">最近活跃学生</h2>
          {recentActiveStudents.length > 0 ? (
            <div className="space-y-3">
              {recentActiveStudents.map(student => {
                const completedCount = student.progress.filter(p => p.completed).length;
                const percentage = Math.round((completedCount / totalExercises) * 100);
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-400">{student.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-medium">{percentage}%</p>
                      <p className="text-xs text-gray-400">{completedCount}/{totalExercises} 题</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">暂无学生数据</p>
          )}
        </div>

        {/* 学生详情 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">学生详情</h2>
          {selectedStudent ? (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                <p className="text-gray-400">{selectedStudent.class}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">完成进度</p>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${(selectedStudent.progress.filter(p => p.completed).length / totalExercises) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">已完成题目</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedStudent.progress
                    .filter(p => p.completed)
                    .map(p => {
                      const exercise = exercises.find(e => e.id === p.exerciseId);
                      return exercise ? (
                        <div key={p.exerciseId} className="p-2 bg-gray-700 rounded text-sm">
                          {exercise.title}
                        </div>
                      ) : null;
                    })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">点击左侧学生查看详情</p>
          )}
        </div>
      </div>
    </div>
  );
}
