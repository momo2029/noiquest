import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Exercise } from '../../types';
import { api } from '../../services/api';
import { ArrowLeft, Lightbulb, Eye, EyeOff, CheckCircle, Loader2, Zap } from 'lucide-react';

interface ExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
  onLoadCode: (code: string) => void;
  onComplete: () => void;
  isCompleted: boolean;
}

interface ExerciseDetailData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  xp: number;
  starterCode?: string;
  hint?: string;
  solution?: string;
  testCases?: {
    id: string;
    orderIndex: number;
    isHidden: boolean;
    input?: string;
    output?: string;
  }[];
  userProgress?: {
    completed: boolean;
    completedCount: number;
    xpEarned: number;
    savedCode?: string;
  };
}

const difficultyColors: Record<string, string> = {
  EASY: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HARD: 'bg-red-500',
};

export default function ExerciseDetail({
  exercise,
  onBack,
  onLoadCode,
  onComplete,
  isCompleted: initialCompleted
}: ExerciseDetailProps) {
  const { t } = useTranslation();
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [detail, setDetail] = useState<ExerciseDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [completionResult, setCompletionResult] = useState<{
    xpEarned: number;
    isFirstCompletion: boolean;
  } | null>(null);

  const difficultyLabels: Record<string, string> = {
    EASY: t('exercises.easy'),
    MEDIUM: t('exercises.medium'),
    HARD: t('exercises.hard'),
  };

  // 获取题目详情
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await api.getExerciseDetail(exercise.id);
        setDetail(data);
        if (data.userProgress?.completed) {
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('获取题目详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [exercise.id]);

  // 标记完成
  const handleComplete = async () => {
    try {
      setCompleting(true);
      // 调用 submit 接口，后端会执行代码验证
      const result = await api.submitExercise(exercise.id, detail?.userProgress?.savedCode || detail?.starterCode || '');

      if (result.correct) {
        setIsCompleted(true);
        setCompletionResult({
          xpEarned: result.xpEarned,
          isFirstCompletion: result.isFirstCompletion,
        });
        onComplete();
      } else {
        // 代码验证失败
        alert(result.message || t('exercises.verificationFailed'));
      }
    } catch (error: any) {
      alert(error.message || t('exercises.submitFailed'));
    } finally {
      setCompleting(false);
    }
  };

  // 加载代码
  const handleLoadCode = () => {
    const code = detail?.userProgress?.savedCode || detail?.starterCode || exercise.starterCode;
    if (code) {
      onLoadCode(code);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  const displayData = detail || exercise;

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-3"
        >
          <ArrowLeft size={18} />
          {t('exercises.backToList')}
        </button>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{displayData.title}</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{displayData.category}</span>
            <span className={`px-2 py-0.5 text-xs rounded ${difficultyColors[displayData.difficulty] || 'bg-gray-500'} text-white`}>
              {difficultyLabels[displayData.difficulty] || displayData.difficulty}
            </span>
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <Zap size={12} />
              +{displayData.xp} XP
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-green-600 text-white">
                <CheckCircle size={12} />
                {t('exercises.completed')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 完成提示 */}
        {completionResult && (
          <div className="bg-green-900/50 border border-green-600 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={20} />
              <span className="font-medium">
                {completionResult.isFirstCompletion ? t('exercises.firstCompletion') : t('exercises.completedAgain')}
              </span>
            </div>
            <p className="text-green-300 mt-1">
              {t('exercises.earned', { xp: completionResult.xpEarned })}
            </p>
          </div>
        )}

        {/* 题目描述 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-blue-400">{t('exercises.problemDescription')}</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{displayData.description}</p>
        </div>

        {/* 测试用例预览 */}
        {detail?.testCases && detail.testCases.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-blue-400">{t('exercises.testCases')}</h3>
            <div className="space-y-3">
              {detail.testCases.map((tc, index) => (
                <div key={tc.id} className="bg-gray-900 rounded p-3">
                  <div className="text-sm text-gray-400 mb-1">{t('exercises.testCase', { index: index + 1 })}</div>
                  {tc.isHidden ? (
                    <p className="text-gray-500 italic">{t('exercises.hiddenTestCase')}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">{t('exercises.input')}</span>
                        <pre className="mt-1 text-gray-300 bg-gray-800 p-2 rounded">{tc.input}</pre>
                      </div>
                      <div>
                        <span className="text-gray-400">{t('exercises.expectedOutput')}</span>
                        <pre className="mt-1 text-gray-300 bg-gray-800 p-2 rounded">{tc.output}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 提示 */}
        {(detail?.hint || exercise.hint) && (
          <div className="bg-gray-800 rounded-lg p-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300"
            >
              <Lightbulb size={18} />
              {showHint ? t('exercises.hideHint') : t('exercises.showHint')}
            </button>
            {showHint && (
              <p className="mt-3 text-gray-300 pl-6">{detail?.hint || exercise.hint}</p>
            )}
          </div>
        )}

        {/* 参考答案 */}
        {(detail?.solution || exercise.solution) && (
          <div className="bg-gray-800 rounded-lg p-4">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
            >
              {showSolution ? <EyeOff size={18} /> : <Eye size={18} />}
              {showSolution ? t('exercises.hideSolution') : t('exercises.showSolution')}
            </button>
            {showSolution && (
              <pre className="mt-3 p-3 bg-gray-900 rounded text-sm overflow-x-auto">
                <code className="text-gray-300">{detail?.solution || exercise.solution}</code>
              </pre>
            )}
          </div>
        )}

        {/* 代码执行服务提示 */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
          <p className="text-blue-400 text-sm">
            {t('exercises.codeHint')}
          </p>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="p-4 border-t border-gray-700 flex gap-3">
        <button
          onClick={handleLoadCode}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          {detail?.userProgress?.savedCode ? t('exercises.loadSavedCode') : t('exercises.loadInitialCode')}
        </button>
        {!isCompleted && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {completing ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {t('exercises.processing')}
              </>
            ) : (
              t('exercises.markAsComplete')
            )}
          </button>
        )}
      </div>
    </div>
  );
}
