import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Exercise, LessonCompleteResult } from '../../types';
import QuestionRenderer from '../Questions/QuestionRenderer';
import AnswerFeedback from '../Feedback/AnswerFeedback';
import LevelUpModal from '../Feedback/LevelUpModal';
import AIHintModal from '../Feedback/AIHintModal';
import { X, Heart, Zap } from 'lucide-react';

interface LessonSessionProps {
  lessonId: string;
  onComplete: (result: LessonCompleteResult) => void;
  onExit: () => void;
}

export default function LessonSession({ lessonId, onComplete, onExit }: LessonSessionProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [mistakes, setMistakes] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{ correct: boolean; feedback: string; xp: number } | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [currentQuestionMistakes, setCurrentQuestionMistakes] = useState(0);
  const [showAIHint, setShowAIHint] = useState(false);

  useEffect(() => {
    startLesson();
  }, [lessonId]);

  const startLesson = async () => {
    try {
      setLoading(true);
      // 获取真实心数
      const heartsStatus = await api.getHeartsStatus();
      setHearts(heartsStatus.hearts);

      const lesson = await api.getLesson(lessonId);
      setLessonTitle(lesson.title);
      const { exercises: lessonExercises } = await api.startLesson(lessonId);
      setExercises(lessonExercises);
    } catch (error) {
      console.error('Failed to start lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: any) => {
    const currentExercise = exercises[currentIndex];
    try {
      const result = await api.submitAnswer(currentExercise.id, answer, lessonId);

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
        setCurrentQuestionMistakes(prev => prev + 1);
        // 调用后端扣心
        try {
          const heartResult = await api.consumeHeart(1);
          setHearts(heartResult.hearts);
        } catch (error) {
          console.error('Failed to consume heart:', error);
          setHearts(prev => Math.max(0, prev - 1));
        }
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
        const result = await api.completeLesson(lessonId, mistakes);
        onComplete(result);
      } catch (error) {
        console.error('Failed to complete lesson:', error);
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
        const result = await api.completeLesson(lessonId, mistakes);
        onComplete(result);
      } catch (error) {
        console.error('Failed to complete lesson:', error);
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
          <p className="text-white/70">准备课程...</p>
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
        <h2 className="text-white/70 text-sm">{lessonTitle}</h2>
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

      {/* 升级弹窗 */}
      {showLevelUp && (
        <LevelUpModal
          level={1}
          onClose={() => setShowLevelUp(false)}
        />
      )}
    </div>
  );
}
