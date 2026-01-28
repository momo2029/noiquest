import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Zap, Lightbulb, SkipForward } from 'lucide-react';

interface AnswerFeedbackProps {
  correct: boolean;
  feedback: string;
  xpEarned: number;
  onContinue: () => void;
  onRetry?: () => void;
  onSkip?: () => void;
  showAIHintButton?: boolean;
  onAIHint?: () => void;
}

export default function AnswerFeedback({ correct, feedback, xpEarned, onContinue, onRetry, onSkip, showAIHintButton, onAIHint }: AnswerFeedbackProps) {
  const [countdown, setCountdown] = useState(3);
  const [autoContinue, setAutoContinue] = useState(false);

  useEffect(() => {
    if (!correct) return;

    console.log('✅ 答题正确，启动自动跳转...');

    // 倒计时显示
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 3秒后自动跳转
    const timer = setTimeout(() => {
      console.log('⏱️  3秒倒计时结束，执行自动跳转');
      setAutoContinue(true);
      onContinue();
    }, 3000);

    return () => {
      console.log('🧹 清理定时器');
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [correct, onContinue]);

  // 调试：显示状态
  useEffect(() => {
    console.log(`📊 状态更新 - correct: ${correct}, countdown: ${countdown}, autoContinue: ${autoContinue}`);
  }, [correct, countdown, autoContinue]);

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 p-6 transition-all duration-300
      ${correct ? 'bg-green-500' : 'bg-red-500'}
    `}>
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* 左侧反馈信息 */}
        <div className="flex items-center gap-4">
          {/* 图标 */}
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${correct ? 'bg-green-400' : 'bg-red-400'}
          `}>
            {correct ? (
              <CheckCircle size={28} className="text-white" />
            ) : (
              <XCircle size={28} className="text-white" />
            )}
          </div>

          {/* 文字 */}
          <div>
            <h3 className="text-white font-bold text-lg">
              {correct ? '回答正确！' : '回答错误'}
            </h3>
            <p className="text-white/80 text-sm">{feedback}</p>
          </div>

          {/* XP 获得 */}
          {correct && xpEarned > 0 && (
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full ml-4">
              <Zap className="text-yellow-300" size={18} />
              <span className="text-white font-bold">+{xpEarned} XP</span>
            </div>
          )}
        </div>

        {/* 按钮区域 */}
        <div className="flex items-center gap-3">
          {/* AI 提示按钮 - 答错两次后显示 */}
          {!correct && showAIHintButton && onAIHint && (
            <button
              onClick={onAIHint}
              className="px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all bg-yellow-400 text-yellow-900 hover:bg-yellow-300"
            >
              <Lightbulb size={20} />
              AI 提示
            </button>
          )}

          {/* 答错时显示：跳过按钮 */}
          {!correct && onSkip && (
            <button
              onClick={onSkip}
              className="px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all bg-white/20 text-white hover:bg-white/30"
            >
              跳过
              <SkipForward size={20} />
            </button>
          )}

          {/* 继续/重试按钮 */}
          <button
            onClick={correct ? onContinue : (onRetry || onContinue)}
            className={`
              px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all
              ${correct
                ? 'bg-white text-green-600 hover:bg-green-50'
                : 'bg-white text-red-600 hover:bg-red-50'
              }
            `}
          >
            {correct ? `继续 (${countdown}s)` : '重试'}
            {correct ? <ChevronRight size={20} /> : <RotateCcw size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
