import { CheckCircle, XCircle, ChevronRight, RotateCcw, Zap, Lightbulb } from 'lucide-react';

interface AnswerFeedbackProps {
  correct: boolean;
  feedback: string;
  xpEarned: number;
  onContinue: () => void;
  showAIHintButton?: boolean;
  onAIHint?: () => void;
}

export default function AnswerFeedback({ correct, feedback, xpEarned, onContinue, showAIHintButton, onAIHint }: AnswerFeedbackProps) {
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

          {/* 继续/重试按钮 */}
          <button
            onClick={onContinue}
            className={`
              px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all
              ${correct
                ? 'bg-white text-green-600 hover:bg-green-50'
                : 'bg-white text-red-600 hover:bg-red-50'
              }
            `}
          >
            {correct ? '继续' : '重试'}
            {correct ? <ChevronRight size={20} /> : <RotateCcw size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
