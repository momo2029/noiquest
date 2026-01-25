import { useState } from 'react';
import { Student } from '../../types';
import { exercises } from '../../data/exercises';
import { Plus, Trash2, Search, User } from 'lucide-react';
import { createDefaultStudent } from '../../utils/storage';

interface StudentListProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export default function StudentList({ students, onAddStudent, onDeleteStudent }: StudentListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = () => {
    if (newName.trim() && newClass.trim()) {
      const student: Student = {
        ...createDefaultStudent(newName.trim()),
        class: newClass.trim(),
      };
      onAddStudent(student);
      setNewName('');
      setNewClass('');
      setShowAddForm(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.includes(searchTerm) || s.class.includes(searchTerm)
  );

  const totalExercises = exercises.length;

  return (
    <div className="h-full bg-gray-900 text-white p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">学生管理</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          <Plus size={18} />
          添加学生
        </button>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索学生姓名或班级..."
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* 添加学生表单 */}
      {showAddForm && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-4">添加新学生</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="学生姓名"
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              placeholder="班级"
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
            >
              确认添加
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 学生列表 */}
      <div className="space-y-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map(student => {
            const completedCount = student.progress.filter(p => p.completed).length;
            const percentage = Math.round((completedCount / totalExercises) * 100);
            return (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-400">{student.class}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-blue-400 font-medium">{percentage}%</p>
                    <p className="text-xs text-gray-400">完成 {completedCount}/{totalExercises} 题</p>
                  </div>
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <button
                    onClick={() => onDeleteStudent(student.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-400">
            {searchTerm ? '没有找到匹配的学生' : '暂无学生，点击上方按钮添加'}
          </div>
        )}
      </div>
    </div>
  );
}
