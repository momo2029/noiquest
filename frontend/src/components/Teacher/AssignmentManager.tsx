import { useState } from 'react';
import { Assignment } from '../../types';
import { exercises } from '../../data/exercises';
import { Plus, Trash2, Calendar, CheckSquare, Square } from 'lucide-react';
import { generateId } from '../../utils/storage';

interface AssignmentManagerProps {
  assignments: Assignment[];
  onAddAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
}

export default function AssignmentManager({
  assignments,
  onAddAssignment,
  onDeleteAssignment
}: AssignmentManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const handleAdd = () => {
    if (title.trim() && selectedExercises.length > 0) {
      const assignment: Assignment = {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        exerciseIds: selectedExercises,
        dueDate,
        createdAt: new Date().toISOString()
      };
      onAddAssignment(assignment);
      setTitle('');
      setDescription('');
      setDueDate('');
      setSelectedExercises([]);
      setShowAddForm(false);
    }
  };

  const toggleExercise = (id: string) => {
    setSelectedExercises(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-full bg-gray-900 text-white p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">作业管理</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          <Plus size={18} />
          布置作业
        </button>
      </div>

      {/* 添加作业表单 */}
      {showAddForm && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-4">布置新作业</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="作业标题"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="作业说明（可选）"
              rows={2}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div>
              <label className="block text-sm text-gray-400 mb-2">截止日期</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">选择题目</label>
              <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-700 rounded-lg p-3">
                {exercises.map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => toggleExercise(ex.id)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded cursor-pointer"
                  >
                    {selectedExercises.includes(ex.id) ? (
                      <CheckSquare size={18} className="text-blue-400" />
                    ) : (
                      <Square size={18} className="text-gray-400" />
                    )}
                    <span>{ex.title}</span>
                    <span className="text-xs text-gray-400">({ex.category})</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                已选择 {selectedExercises.length} 道题目
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              disabled={!title.trim() || selectedExercises.length === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg"
            >
              确认布置
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

      {/* 作业列表 */}
      <div className="space-y-4">
        {assignments.length > 0 ? (
          assignments.map(assignment => (
            <div key={assignment.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{assignment.title}</h3>
                  {assignment.description && (
                    <p className="text-gray-400 text-sm mt-1">{assignment.description}</p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteAssignment(assignment.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  截止: {assignment.dueDate || '无'}
                </span>
                <span>包含 {assignment.exerciseIds.length} 道题目</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {assignment.exerciseIds.map(id => {
                  const ex = exercises.find(e => e.id === id);
                  return ex ? (
                    <span
                      key={id}
                      className="px-2 py-1 text-xs bg-gray-700 rounded"
                    >
                      {ex.title}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            暂无作业，点击上方按钮布置新作业
          </div>
        )}
      </div>
    </div>
  );
}
