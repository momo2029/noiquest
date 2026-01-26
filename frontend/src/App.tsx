import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import EmailLogin from './components/Auth/EmailLogin';
import EmailRegister from './components/Auth/EmailRegister';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import CodeEditor from './components/Editor/CodeEditor';
import FileExplorer from './components/Editor/FileExplorer';
import OutputPanel from './components/Editor/OutputPanel';
import AIChat from './components/AI/AIChat';
import ExerciseList from './components/Learning/ExerciseList';
import ExerciseDetail from './components/Learning/ExerciseDetail';
import ProgressTracker from './components/Learning/ProgressTracker';
import Dashboard from './components/Teacher/Dashboard';
import StudentList from './components/Teacher/StudentList';
import AssignmentManager from './components/Teacher/AssignmentManager';
import SkillTreeView from './components/SkillTree/SkillTreeView';
import LessonSession from './components/SkillTree/LessonSession';
import ReviewDashboard from './components/Review/ReviewDashboard';
import ReviewSession from './components/Review/ReviewSession';
import AdminLayout from './components/Admin/AdminLayout';
import LeaderboardView from './components/Leaderboard/LeaderboardView';
import AchievementsView from './components/Achievements/AchievementsView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import { UserRole, Exercise, Student, Assignment, AppSettings, CodeFile, LessonCompleteResult, ReviewCompleteResult } from './types';
import { exercises } from './data/exercises';
import {
  getSettings,
  saveSettings,
  getStudents,
  saveStudents,
  getAssignments,
  saveAssignments,
  generateId,
  createDefaultStudent,
  updateStreak,
  addXp
} from './utils/storage';

const defaultFiles: CodeFile[] = [
  {
    id: 'main',
    name: 'main.cpp',
    content: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
    language: 'cpp'
  }
];

function MainApp() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // 核心状态
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  const [students, setStudents] = useState<Student[]>(() => getStudents());
  const [assignments, setAssignments] = useState<Assignment[]>(() => getAssignments());

  // 编辑器状态
  const [files, setFiles] = useState<CodeFile[]>(defaultFiles);
  const [activeFileId, setActiveFileId] = useState('main');
  const [selectedCode, setSelectedCode] = useState('');

  // 面板状态
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showOutput, setShowOutput] = useState(true);
  const [outputHeight, setOutputHeight] = useState(200);

  // 执行状态
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // 视图状态 - 根据用户角色设置默认视图
  const userRole: UserRole = user?.role === 'TEACHER' ? 'teacher' : user?.role === 'ADMIN' ? 'admin' : 'student';
  const [currentView, setCurrentView] = useState<string>(
    userRole === 'student' ? 'skill-tree' : 'dashboard'
  );
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // 课程学习状态
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // 复习状态
  const [reviewType, setReviewType] = useState<'mistakes' | 'knowledge' | 'mixed' | null>(null);

  // 当前学生
  const [currentStudent, setCurrentStudent] = useState<Student>(() => {
    const existing = students.find(s => s.id === settings.currentStudentId);
    if (existing) return existing;
    return createDefaultStudent(user?.name || '小码农');
  });

  // 当用户登录后更新学生信息
  useEffect(() => {
    if (user && userRole === 'student') {
      setCurrentStudent(prev => ({
        ...prev,
        name: user.name,
        level: user.level,
        xp: user.xp,
        totalXp: user.totalXp,
        streak: user.streak,
        hearts: user.hearts,
        gems: user.gems,
      }));
    }
  }, [user, userRole]);

  // 当用户角色变化时更新视图
  useEffect(() => {
    setCurrentView(userRole === 'student' ? 'skill-tree' : 'dashboard');
  }, [userRole]);

  // 获取当前文件
  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  // 保存设置
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveAssignments(assignments);
  }, [assignments]);

  useEffect(() => {
    if (!students.find(s => s.id === currentStudent.id)) {
      setStudents(prev => [...prev, currentStudent]);
    }
  }, [currentStudent, students]);

  // 更新文件内容
  const updateFileContent = useCallback((content: string) => {
    setFiles(prev => prev.map(f =>
      f.id === activeFileId ? { ...f, content } : f
    ));
  }, [activeFileId]);

  // 创建新文件
  const createFile = useCallback((name: string) => {
    const newFile: CodeFile = {
      id: generateId(),
      name: name.endsWith('.cpp') ? name : `${name}.cpp`,
      content: `#include <iostream>
using namespace std;

int main() {

    return 0;
}
`,
      language: 'cpp'
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  }, []);

  // 删除文件
  const deleteFile = useCallback((id: string) => {
    if (files.length <= 1) return;
    setFiles(prev => prev.filter(f => f.id !== id));
    if (activeFileId === id) {
      setActiveFileId(files[0].id === id ? files[1].id : files[0].id);
    }
  }, [files, activeFileId]);

  // 运行代码
  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput([]);
    setShowOutput(true);
    const startTime = Date.now();

    setOutput(prev => [...prev, '🔨 正在编译...']);

    await new Promise(resolve => setTimeout(resolve, 500));

    const code = activeFile.content;
    const errors: string[] = [];

    if (!code.includes('#include')) {
      errors.push('警告: 没有包含任何头文件');
    }
    if (!code.includes('int main()') && !code.includes('int main(void)')) {
      errors.push('错误: 缺少 main 函数');
    }
    if ((code.match(/{/g) || []).length !== (code.match(/}/g) || []).length) {
      errors.push('错误: 大括号不匹配');
    }
    if (code.includes('cout') && !code.includes('<iostream>')) {
      errors.push('错误: 使用 cout 需要包含 <iostream>');
    }

    if (errors.length > 0) {
      setOutput(prev => [...prev, '❌ 编译失败:', ...errors.map(e => `   ${e}`)]);
      setIsRunning(false);
      setExecutionTime(Date.now() - startTime);
      return;
    }

    setOutput(prev => [...prev, '✅ 编译成功!', '', '📤 程序输出:', '─'.repeat(40)]);

    await new Promise(resolve => setTimeout(resolve, 300));

    const coutMatches = code.matchAll(/cout\s*<<\s*"([^"]*)"/g);
    const outputs: string[] = [];
    for (const match of coutMatches) {
      outputs.push(match[1]);
    }

    const varOutputs = code.matchAll(/cout\s*<<\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:<<|;)/g);
    for (const match of varOutputs) {
      if (match[1] !== 'endl') {
        outputs.push(`[变量 ${match[1]} 的值]`);
      }
    }

    if (outputs.length > 0) {
      setOutput(prev => [...prev, ...outputs]);
    } else {
      setOutput(prev => [...prev, '(程序没有输出)']);
    }

    setOutput(prev => [...prev, '', '─'.repeat(40), '✨ 程序运行结束']);
    setExecutionTime(Date.now() - startTime);
    setIsRunning(false);
  }, [activeFile]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning) runCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, runCode]);

  // 完成练习 - 带经验值奖励
  const handleCompleteExercise = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    // 检查是否已完成
    const alreadyCompleted = currentStudent.progress.some(
      p => p.exerciseId === exerciseId && p.completed
    );

    let updatedStudent = {
      ...currentStudent,
      progress: [
        ...currentStudent.progress.filter(p => p.exerciseId !== exerciseId),
        {
          exerciseId,
          completed: true,
          code: activeFile.content,
          completedAt: new Date().toISOString()
        }
      ]
    };

    // 如果是首次完成，给予经验值奖励
    if (!alreadyCompleted) {
      updatedStudent = addXp(updatedStudent, exercise.xp);
      updatedStudent = updateStreak(updatedStudent);
    }

    setCurrentStudent(updatedStudent);
    setStudents(prev =>
      prev.map(s => (s.id === currentStudent.id ? updatedStudent : s))
    );
  };

  const completedIds = currentStudent.progress
    .filter(p => p.completed)
    .map(p => p.exerciseId);

  // 处理课程完成
  const handleLessonComplete = (result: LessonCompleteResult) => {
    // 更新学生经验值
    if (result.xpEarned > 0) {
      setCurrentStudent(prev => addXp(prev, result.xpEarned));
    }
    setActiveLessonId(null);
    // 可以显示完成弹窗
    alert(`课程完成！获得 ${result.xpEarned} XP${result.perfectRun ? ' (完美通关!)' : ''}`);
  };

  // 处理复习完成
  const handleReviewComplete = (result: ReviewCompleteResult) => {
    if (result.xpEarned > 0) {
      setCurrentStudent(prev => addXp(prev, result.xpEarned));
    }
    setReviewType(null);
    alert(`复习完成！正确率 ${result.accuracy}%，获得 ${result.xpEarned} XP`);
  };

  // 渲染主内容
  const renderMainContent = () => {
    // 课程学习会话
    if (activeLessonId) {
      return (
        <LessonSession
          lessonId={activeLessonId}
          onComplete={handleLessonComplete}
          onExit={() => setActiveLessonId(null)}
        />
      );
    }

    // 复习会话
    if (reviewType) {
      return (
        <ReviewSession
          type={reviewType}
          onComplete={handleReviewComplete}
          onExit={() => setReviewType(null)}
        />
      );
    }

    if (userRole === 'student') {
      switch (currentView) {
        case 'skill-tree':
          return (
            <SkillTreeView
              onStartLesson={(lessonId) => setActiveLessonId(lessonId)}
            />
          );
        case 'review':
          return (
            <ReviewDashboard
              onStartReview={(type) => setReviewType(type)}
            />
          );
        case 'editor':
          return (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 flex overflow-hidden">
                {showFileExplorer && (
                  <FileExplorer
                    files={files}
                    activeFileId={activeFileId}
                    onSelectFile={setActiveFileId}
                    onCreateFile={createFile}
                    onDeleteFile={deleteFile}
                    onClose={() => setShowFileExplorer(false)}
                  />
                )}

                <div className="flex-1 flex flex-col min-w-0">
                  <CodeEditor
                    file={activeFile}
                    files={files}
                    onContentChange={updateFileContent}
                    onSelectionChange={setSelectedCode}
                    onFileSelect={setActiveFileId}
                    onFileClose={deleteFile}
                    onRun={runCode}
                    isRunning={isRunning}
                  />
                </div>

                {showAIPanel && (
                  <div className="w-80 border-l border-gray-700 flex-shrink-0">
                    <AIChat
                      selectedCode={selectedCode}
                      currentCode={activeFile.content}
                      onClose={() => setShowAIPanel(false)}
                    />
                  </div>
                )}
              </div>

              {showOutput && (
                <OutputPanel
                  output={output}
                  isRunning={isRunning}
                  executionTime={executionTime}
                  height={outputHeight}
                  onHeightChange={setOutputHeight}
                  onClear={() => setOutput([])}
                  onClose={() => setShowOutput(false)}
                />
              )}
            </div>
          );
        case 'exercises':
          return selectedExercise ? (
            <ExerciseDetail
              exercise={selectedExercise}
              onBack={() => setSelectedExercise(null)}
              onLoadCode={(starterCode) => {
                updateFileContent(starterCode);
                setCurrentView('editor');
                setSelectedExercise(null);
              }}
              onComplete={() => handleCompleteExercise(selectedExercise.id)}
              isCompleted={completedIds.includes(selectedExercise.id)}
            />
          ) : (
            <ExerciseList
              onSelectExercise={setSelectedExercise}
            />
          );
        case 'progress':
          return <ProgressTracker completedIds={completedIds} student={currentStudent} />;
        case 'leaderboard':
          return <LeaderboardView />;
        case 'achievements':
          return <AchievementsView />;
        case 'analytics':
          return <AnalyticsView />;
        default:
          return null;
      }
    } else {
      switch (currentView) {
        case 'dashboard':
          return <Dashboard students={students} assignments={assignments} />;
        case 'students':
          return (
            <StudentList
              students={students}
              onAddStudent={(student) => setStudents(prev => [...prev, student])}
              onDeleteStudent={(id) => setStudents(prev => prev.filter(s => s.id !== id))}
            />
          );
        case 'assignments':
          return (
            <AssignmentManager
              assignments={assignments}
              onAddAssignment={(assignment) => setAssignments(prev => [...prev, assignment])}
              onDeleteAssignment={(id) => setAssignments(prev => prev.filter(a => a.id !== id))}
            />
          );
        default:
          return null;
      }
    }
  };

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#131f24]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-3xl">🐿️</span>
          </div>
          <p className="text-white">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录显示登录/注册页面
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <EmailLogin
          onRegister={() => setAuthView('register')}
        />
      );
    }
    return (
      <EmailRegister
        onBack={() => setAuthView('login')}
      />
    );
  }

  // 管理员显示管理后台
  if (user?.role === 'ADMIN') {
    return (
      <AdminLayout
        userName={user.name}
        onLogout={logout}
      />
    );
  }

  // 已登录显示主应用
  return (
    <div className="h-screen flex flex-col bg-[#131f24] text-white overflow-hidden">
      <Header
        role={userRole}
        settings={settings}
        onSettingsChange={setSettings}
        showFileExplorer={showFileExplorer}
        showAIPanel={showAIPanel}
        showOutput={showOutput}
        onToggleFileExplorer={() => setShowFileExplorer(!showFileExplorer)}
        onToggleAIPanel={() => setShowAIPanel(!showAIPanel)}
        onToggleOutput={() => setShowOutput(!showOutput)}
        student={userRole === 'student' ? currentStudent : undefined}
        userName={user?.name}
        onLogout={logout}
        onViewChange={setCurrentView}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          role={userRole}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        <main className="flex-1 flex overflow-hidden">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
