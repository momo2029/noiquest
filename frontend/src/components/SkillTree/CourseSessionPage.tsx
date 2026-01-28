import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Exercise } from '../../types';
import QuestionRenderer from '../Questions/QuestionRenderer';
import AnswerFeedback from '../Feedback/AnswerFeedback';
import AIHintModal from '../Feedback/AIHintModal';
import { X, Heart, Zap, BookOpen } from 'lucide-react';

interface CourseSessionCompleteResult {
  message: string;
  xpEarned: number;
  perfectRun: boolean;
  courseCompleted: boolean;
  sessionsCompleted: number;
  totalSessions: number;
  crownLevel: number;
}

interface CourseSessionPageProps {
  sessionId: string;
  onComplete: (result: CourseSessionCompleteResult) => void;
  onExit: () => void;
}

export default function CourseSessionPage({ sessionId, onComplete, onExit }: CourseSessionPageProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [mistakes, setMistakes] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{ correct: boolean; feedback: string; xp: number } | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [currentQuestionMistakes, setCurrentQuestionMistakes] = useState(0);
  const [showAIHint, setShowAIHint] = useState(false);

  useEffect(() => {
    startSession();
  }, [sessionId]);

  const startSession = async () => {
    try {
      setLoading(true);
      // 获取课时信息
      const sessionInfo = await api.getCourseSession(sessionId);
      setSessionTitle(sessionInfo.title);
      setCourseTitle(sessionInfo.course?.title || '');

      // 开始课时学习
      const { exercises: sessionExercises } = await api.startCourseSession(sessionId);
      setExercises(sessionExercises);
    } catch (error) {
      console.error('Failed to start course session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: unknown) => {
    const currentExercise = exercises[currentIndex];
    try {
      const result = await api.submitAnswer(currentExercise.id, answer);

      setFeedbackData({
        correct: result.correct,
        feedback: result.feedback,
        xp: result.xpEarned,
      });
      setShowFeedback(true);

      if (result.correct) {
        setXpEarned(prev => prev + result.xpEarned);
        setCurrentQuestionMistakes(0);
      } else {
        setMistakes(prev => prev + 1);
        setHearts(prev => Math.max(0, prev - 1));
        setCurrentQuestionMistakes(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  // 答对后继续下一题
  const handleContinue = async () => {
    setShowFeedback(false);
    setFeedbackData(null);

    // 检查是否完成所有题目
    if (currentIndex >= exercises.length - 1) {
      try {
        const result = await api.completeCourseSession(sessionId, mistakes);
        onComplete(result);
      } catch (error) {
        console.error('Failed to complete course session:', error);
        onExit();
      }
    } else {
      setCurrentIndex(prev => prev + 1);
      setCurrentQuestionMistakes(0);
    }
  };

  // 答错后重试当前题
  const handleRetry = () => {
    setShowFeedback(false);
    setFeedbackData(null);
    // 检查生命值
    if (hearts <= 0) {
      onExit();
      return;
    }
    // 保持在当前题，不重置 currentQuestionMistakes
  };

  // 答错后跳过当前题
  const handleSkip = async () => {
    setShowFeedback(false);
    setFeedbackData(null);
    // 检查生命值
    if (hearts <= 0) {
      onExit();
      return;
    }
    // 进入下一题
    if (currentIndex >= exercises.length - 1) {
      try {
        const result = await api.completeCourseSession(sessionId, mistakes);
        onComplete(result);
      } catch (error) {
        console.error('Failed to complete course session:', error);
        onExit();
      }
    } else {
      setCurrentIndex(prev => prev + 1);
      setCurrentQuestionMistakes(0);
    }
  };

  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1a1a2e] flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">准备课时...</p>
        </div>
      </div>
    );
  }

  // 如果没有练习题
  if (exercises.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#1a1a2e] flex flex-col z-50">
        <div className="h-16 bg-[#252536] flex items-center px-4 gap-4">
          <button
            onClick={onExit}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-white font-medium">{courseTitle} - {sessionTitle}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={40} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">课时内容开发中</h3>
            <p className="text-white/60 mb-6">
              该课时的练习题正在开发中，敬请期待！
              <br />
              你可以先学习其他已完成的课时。
            </p>
            <button
              onClick={onExit}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              返回课程
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];

  return (
    <div className="fixed inset-0 bg-[#1a1a2e] flex flex-col z-50">
      {/* 顶部栏 */}
      <div className="h-16 bg-[#252536] flex items-center px-4 gap-4">
        {/* 退出按钮 */}
        <button
          onClick={onExit}
          className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>

        {/* 进度条 */}
        <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 生命值 */}
        <div className="flex items-center gap-1.5 bg-red-500/20 px-3 py-1.5 rounded-xl">
          <Heart className="text-red-400 fill-red-400" size={20} />
          <span className="text-white font-bold">{hearts}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1.5 rounded-xl">
          <Zap className="text-yellow-400" size={20} />
          <span className="text-white font-bold">{xpEarned}</span>
        </div>
      </div>

      {/* 课程标题 */}
      <div className="text-center py-4">
        <h2 className="text-white/70 text-sm">{courseTitle} - {sessionTitle}</h2>
        <p className="text-white/50 text-xs">第 {currentIndex + 1} / {exercises.length} 题</p>
      </div>

      {/* 题目区域 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-3xl mx-auto">
          {currentExercise && (
            <QuestionRenderer
              exercise={currentExercise}
              onSubmit={handleAnswer}
              disabled={showFeedback}
            />
          )}
        </div>
      </div>

      {/* 答题反馈 */}
      {showFeedback && feedbackData && (
        <AnswerFeedback
          correct={feedbackData.correct}
          feedback={feedbackData.feedback}
          xpEarned={feedbackData.xp}
          onContinue={handleContinue}
          onRetry={handleRetry}
          onSkip={handleSkip}
          showAIHintButton={!feedbackData.correct && currentQuestionMistakes >= 2}
          onAIHint={() => setShowAIHint(true)}
        />
      )}

      {/* AI 提示弹窗 */}
      {showAIHint && currentExercise && (
        <AIHintModal
          exercise={currentExercise}
          onClose={() => setShowAIHint(false)}
        />
      )}
    </div>
  );
}
