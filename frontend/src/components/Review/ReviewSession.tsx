import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Exercise, ReviewCompleteResult } from '../../types';
import QuestionRenderer from '../Questions/QuestionRenderer';
import AnswerFeedback from '../Feedback/AnswerFeedback';
import { X, RefreshCw, Zap } from 'lucide-react';

interface ReviewSessionProps {
  type: 'mistakes' | 'knowledge' | 'mixed';
  onComplete: (result: ReviewCompleteResult) => void;
  onExit: () => void;
}

export default function ReviewSession({ type, onComplete, onExit }: ReviewSessionProps) {
  const [exercises, setExercises] = useState<(Exercise & { reviewType: string; mistakeRecordId?: string; knowledgeKey?: string })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ exerciseId: string; correct: boolean; reviewType: string; mistakeRecordId?: string; knowledgeKey?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{ correct: boolean; feedback: string; xp: number } | null>(null);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    startSession();
  }, [type]);

  const startSession = async () => {
    try {
      setLoading(true);
      const session = await api.startReviewSession(type, 10);
      setExercises(session.exercises);
    } catch (error) {
      console.error('Failed to start review session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: any) => {
    const currentExercise = exercises[currentIndex];
    try {
      const result = await api.submitAnswer(currentExercise.id, answer);

      // 记录结果
      setResults(prev => [...prev, {
        exerciseId: currentExercise.id,
        correct: result.correct,
        reviewType: currentExercise.reviewType,
        mistakeRecordId: currentExercise.mistakeRecordId,
        knowledgeKey: currentExercise.knowledgeKey,
      }]);

      setFeedbackData({
        correct: result.correct,
        feedback: result.feedback,
        xp: result.correct ? 5 : 0, // 复习正确获得 5 XP
      });

      if (result.correct) {
        setXpEarned(prev => prev + 5);
      }

      setShowFeedback(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleContinue = async () => {
    setShowFeedback(false);
    setFeedbackData(null);

    // 检查是否完成所有题目
    if (currentIndex >= exercises.length - 1) {
      try {
        const completeResult = await api.completeReview(results);
        onComplete(completeResult);
      } catch (error) {
        console.error('Failed to complete review:', error);
        onExit();
      }
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1a1a2e] flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">准备复习...</p>
        </div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#1a1a2e] flex items-center justify-center z-50">
        <div className="text-center">
          <RefreshCw className="text-white/30 mx-auto mb-4" size={48} />
          <p className="text-white/70 mb-4">暂无需要复习的内容</p>
          <button
            onClick={onExit}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
          >
            返回
          </button>
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
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 复习标识 */}
        <div className="flex items-center gap-1.5 bg-orange-500/20 px-3 py-1.5 rounded-xl">
          <RefreshCw className="text-orange-400" size={18} />
          <span className="text-white/70 text-sm">复习</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1.5 rounded-xl">
          <Zap className="text-yellow-400" size={20} />
          <span className="text-white font-bold">{xpEarned}</span>
        </div>
      </div>

      {/* 复习类型标识 */}
      <div className="text-center py-4">
        <span className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${currentExercise.reviewType === 'mistake' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}
        `}>
          {currentExercise.reviewType === 'mistake' ? '错题复习' : '知识点复习'}
        </span>
        <p className="text-white/50 text-xs mt-2">第 {currentIndex + 1} / {exercises.length} 题</p>
      </div>

      {/* 题目区域 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-3xl mx-auto">
          <QuestionRenderer
            exercise={currentExercise}
            onSubmit={handleAnswer}
            disabled={showFeedback}
          />
        </div>
      </div>

      {/* 答题反馈 */}
      {showFeedback && feedbackData && (
        <AnswerFeedback
          correct={feedbackData.correct}
          feedback={feedbackData.feedback}
          xpEarned={feedbackData.xp}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
