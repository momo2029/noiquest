import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import EmailLogin from './components/Auth/EmailLogin';
import EmailRegister from './components/Auth/EmailRegister';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import CodeEditor from './components/Editor/CodeEditor';
import PublicCodeEditor from './components/Editor/PublicCodeEditor';
import FileExplorer from './components/Editor/FileExplorer';
import OutputPanel from './components/Editor/OutputPanel';
import AIChat from './components/AI/AIChat';
import ExerciseList from './components/Learning/ExerciseList';
import ExerciseDetail from './components/Learning/ExerciseDetail';
import ProgressTracker from './components/Learning/ProgressTracker';
import Dashboard from './components/Teacher/Dashboard';
import StudentList from './components/Teacher/StudentList';
import AssignmentManager from './components/Teacher/AssignmentManager';
import LearningCenter from './components/SkillTree/LearningCenter';
import LessonSession from './components/SkillTree/LessonSession';
import ReviewDashboard from './components/Review/ReviewDashboard';
import ReviewSession from './components/Review/ReviewSession';
import AdminLayout from './components/Admin/AdminLayout';
import LeaderboardView from './components/Leaderboard/LeaderboardView';
import AchievementsView from './components/Achievements/AchievementsView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import KnowledgeGraphView from './components/KnowledgeGraph/KnowledgeGraphView';
import { UserRole, Exercise, Student, Assignment, AppSettings, SessionCompleteResult, ReviewCompleteResult } from './types';
import { exercises } from './data/exercises';
import { api } from './services/api';
import {
  getSettings,
  saveSettings,
  getStudents,
  saveStudents,
  getAssignments,
  saveAssignments,
  createDefaultStudent,
  updateStreak,
  addXp,
  getCurrentView,
  saveCurrentView,
} from './utils/storage';
import { useUserFiles } from './hooks/useUserFiles';

// 学生可用的视图
const STUDENT_VIEWS = ['knowledge-map', 'skill-tree', 'review', 'editor', 'exercises', 'progress', 'leaderboard', 'achievements', 'analytics'];
// 教师可用的视图
const TEACHER_VIEWS = ['dashboard', 'students', 'assignments'];
// 公开可访问的视图（不需要登录）
const PUBLIC_VIEWS = ['knowledge-map', 'editor'];

function MainApp() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // 核心状态
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  const [students, setStudents] = useState<Student[]>(() => getStudents());
  const [assignments, setAssignments] = useState<Assignment[]>(() => getAssignments());

  // 编辑器状态 - 使用 useUserFiles hook
  const {
    files,
    activeFile,
    activeFileId,
    openFileIds,
    setActiveFileId,
    updateFileContent,
    createFile,
    deleteFile,
    openFile,
    closeFile,
  } = useUserFiles(isAuthenticated);

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
  const [stdin, setStdin] = useState('');

  // 视图状态 - 根据用户角色设置默认视图，支持路由记忆
  const userRole: UserRole = user?.role === 'TEACHER' ? 'teacher' : user?.role === 'ADMIN' ? 'admin' : 'student';
  const defaultView = userRole === 'student' ? 'skill-tree' : 'dashboard';

  const [currentView, setCurrentViewState] = useState<string>(() => {
    // 初始化时只读取 localStorage 中保存的视图，不做复杂判断
    return getCurrentView('knowledge-map');
  });

  // 包装 setCurrentView 以同时保存到 localStorage
  const setCurrentView = useCallback((view: string) => {
    setCurrentViewState(view);
    saveCurrentView(view);
  }, []);

  // 当认证状态确定后（isLoading 变为 false），根据用户角色正确设置视图
  useEffect(() => {
    if (isLoading) return; // 还在加载中，不处理

    const savedView = getCurrentView(defaultView);

    if (!isAuthenticated) {
      // 未登录时只允许公开视图
      if (!PUBLIC_VIEWS.includes(currentView)) {
        setCurrentViewState(PUBLIC_VIEWS.includes(savedView) ? savedView : 'knowledge-map');
      }
    } else {
      // 已登录，根据角色设置正确的默认视图
      if (userRole === 'student') {
        if (!STUDENT_VIEWS.includes(currentView)) {
          setCurrentViewState(STUDENT_VIEWS.includes(savedView) ? savedView : defaultView);
        }
      } else if (userRole === 'teacher') {
        if (!TEACHER_VIEWS.includes(currentView)) {
          setCurrentViewState(TEACHER_VIEWS.includes(savedView) ? savedView : defaultView);
        }
      }
    }
  }, [isAuthenticated, isLoading, userRole]);

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // 课时学习状态
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

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

  // 运行代码
  const runCode = useCallback(async () => {
    if (!activeFile) return;

    setIsRunning(true);
    setOutput([]);
    setShowOutput(true);
    const startTime = Date.now();

    const code = activeFile.content;

    setOutput(prev => [...prev, '🔨 正在编译...']);

    try {
      const result = await api.executeCode(code, stdin);

      if (result.error) {
        setOutput(prev => [...prev, `❌ 错误: ${result.error}`]);
        setExecutionTime(Date.now() - startTime);
        setIsRunning(false);
        return;
      }

      // 编译错误
      if (result.status.id === 6) {
        setOutput(prev => [
          ...prev,
          '❌ 编译失败:',
          '',
          result.compileOutput || '未知编译错误',
        ]);
        setExecutionTime(Date.now() - startTime);
        setIsRunning(false);
        return;
      }

      setOutput(prev => [...prev, '✅ 编译成功!', '', '📤 程序输出:', '─'.repeat(40)]);

      // 运行时错误
      if (result.status.id === 5) {
        setOutput(prev => [...prev, '⏱️ 超时: 程序运行时间超过限制']);
      } else if (result.status.id === 7) {
        setOutput(prev => [...prev, '💥 运行时错误: 段错误 (SIGSEGV)']);
        if (result.stderr) {
          setOutput(prev => [...prev, result.stderr]);
        }
      } else if (result.status.id === 11) {
        setOutput(prev => [...prev, `💥 运行时错误: ${result.status.description}`]);
        if (result.stderr) {
          setOutput(prev => [...prev, result.stderr]);
        }
      } else {
        // 正常输出
        if (result.stdout) {
          setOutput(prev => [...prev, result.stdout]);
        } else {
          setOutput(prev => [...prev, '(程序没有输出)']);
        }
        if (result.stderr) {
          setOutput(prev => [...prev, '', '⚠️ 标准错误:', result.stderr]);
        }
      }

      setOutput(prev => [
        ...prev,
        '',
        '─'.repeat(40),
        `✨ 程序运行结束 (${result.time.toFixed(3)}s)`,
      ]);
    } catch (error: any) {
      setOutput(prev => [
        ...prev,
        '❌ 执行失败:',
        error.message || '无法连接到代码执行服务',
      ]);
    }

    setExecutionTime(Date.now() - startTime);
    setIsRunning(false);
  }, [activeFile, stdin]);

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

  // 处理课时完成
  const handleSessionComplete = (result: SessionCompleteResult) => {
    if (result.xpEarned > 0) {
      setCurrentStudent(prev => addXp(prev, result.xpEarned));
    }
    setActiveSessionId(null);
    alert(`课时完成！获得 ${result.xpEarned} XP${result.perfectRun ? ' (完美通关!)' : ''}${result.courseCompleted ? ' 课程已完成!' : ''}`);
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
    // 课时学习会话
    if (activeSessionId) {
      return (
        <LessonSession
          lessonId={activeSessionId}
          onComplete={handleSessionComplete}
          onExit={() => setActiveSessionId(null)}
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
        case 'knowledge-map':
          return (
            <KnowledgeGraphView
              onNavigateToSkillTree={() => setCurrentView('skill-tree')}
            />
          );
        case 'skill-tree':
          return (
            <LearningCenter
              onStartSession={(sessionId: string) => setActiveSessionId(sessionId)}
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
                    onSelectFile={openFile}
                    onCreateFile={createFile}
                    onDeleteFile={deleteFile}
                    onClose={() => setShowFileExplorer(false)}
                  />
                )}

                <div className="flex-1 flex flex-col min-w-0">
                  <CodeEditor
                    file={activeFile}
                    files={files.filter(f => openFileIds.includes(f.id))}
                    settings={settings}
                    onContentChange={updateFileContent}
                    onSelectionChange={setSelectedCode}
                    onFileSelect={setActiveFileId}
                    onFileClose={closeFile}
                    onRun={runCode}
                    isRunning={isRunning}
                  />
                </div>

                {showAIPanel && activeFile && (
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
                  stdin={stdin}
                  onStdinChange={setStdin}
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

  // 未登录但访问公开视图
  if (!isAuthenticated && PUBLIC_VIEWS.includes(currentView)) {
    return (
      <div className="h-screen flex flex-col bg-[#131f24] text-white overflow-hidden">
        {/* 简化的顶部栏 */}
        <div className="h-14 bg-[#1a2a31] border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🐿️</span>
            </div>
            <span className="font-bold text-lg">NOIQuest</span>
            <span style={{ fontSize: '0.8em' }}>代码敲得6，同学都喊<span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>6</span><span style={{ color: '#4ade80', fontWeight: 'bold' }}>6</span><span style={{ color: '#facc15', fontWeight: 'bold' }}>6</span>～</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAuthView('login')}
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              登录
            </button>
            <button
              onClick={() => {
                setAuthView('register');
                setCurrentView('login-required');
              }}
              className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
            >
              注册
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 简化的侧边栏 */}
          <div className="w-16 bg-[#1a2a31] border-r border-gray-700 flex flex-col items-center py-4 gap-2">
            <button
              onClick={() => setCurrentView('knowledge-map')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                currentView === 'knowledge-map' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:bg-white/5'
              }`}
              title="知识图谱"
            >
              <span className="text-xl">🗺️</span>
            </button>
            <button
              onClick={() => setCurrentView('editor')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                currentView === 'editor' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:bg-white/5'
              }`}
              title="代码编辑器"
            >
              <span className="text-xl">💻</span>
            </button>
          </div>

          {/* 主内容区 */}
          <main className="flex-1 flex overflow-hidden">
            {currentView === 'knowledge-map' ? (
              <KnowledgeGraphView
                onNavigateToSkillTree={() => {
                  setAuthView('login');
                  setCurrentView('login-required');
                }}
                isPublic={true}
                onLoginRequired={() => {
                  setAuthView('login');
                  setCurrentView('login-required');
                }}
              />
            ) : (
              <PublicCodeEditor
                onLoginRequired={() => {
                  setAuthView('login');
                  setCurrentView('login-required');
                }}
              />
            )}
          </main>
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
