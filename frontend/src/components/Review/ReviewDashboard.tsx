import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { ReviewStatus, KnowledgeMastery } from '../../types';
import MistakeBook from './MistakeBook';
import WeaknessChart from './WeaknessChart';
import { RefreshCw, BookOpen, Brain, AlertTriangle, Play, TrendingUp } from 'lucide-react';

interface ReviewDashboardProps {
  onStartReview: (type: 'mistakes' | 'knowledge' | 'mixed') => void;
}

export default function ReviewDashboard({ onStartReview }: ReviewDashboardProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<ReviewStatus | null>(null);
  const [mastery, setMastery] = useState<KnowledgeMastery[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'mistakes' | 'mastery'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusData, masteryData] = await Promise.all([
        api.getReviewStatus(),
        api.getKnowledgeMastery(),
      ]);
      setStatus(statusData);
      setMastery(masteryData);
    } catch (error) {
      console.error('Failed to load review data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">{t('review.loadingData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">{t('review.title')}</h1>
          <p className="text-white/60">{t('review.subtitle')}</p>
        </div>

        {/* 复习状态卡片 */}
        {status && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 待复习 */}
            <div className="bg-orange-500/20 rounded-2xl p-6 text-center">
              <RefreshCw className="text-orange-400 mx-auto mb-2" size={32} />
              <p className="text-3xl font-black text-white">{status.dueCount}</p>
              <p className="text-white/60 text-sm">{t('review.dueKnowledgePoints')}</p>
            </div>

            {/* 错题 */}
            <div className="bg-red-500/20 rounded-2xl p-6 text-center">
              <AlertTriangle className="text-red-400 mx-auto mb-2" size={32} />
              <p className="text-3xl font-black text-white">{status.mistakeCount}</p>
              <p className="text-white/60 text-sm">{t('review.unreviewedMistakes')}</p>
            </div>

            {/* 薄弱点 */}
            <div className="bg-purple-500/20 rounded-2xl p-6 text-center">
              <Brain className="text-purple-400 mx-auto mb-2" size={32} />
              <p className="text-3xl font-black text-white">{status.weakPoints.length}</p>
              <p className="text-white/60 text-sm">{t('review.weakPoints')}</p>
            </div>
          </div>
        )}

        {/* 开始复习按钮 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => onStartReview('mistakes')}
            disabled={!status || status.mistakeCount === 0}
            className="p-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen size={20} />
            {t('review.reviewMistakes')}
          </button>
          <button
            onClick={() => onStartReview('knowledge')}
            disabled={!status || status.dueCount === 0}
            className="p-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Brain size={20} />
            {t('review.reviewKnowledge')}
          </button>
          <button
            onClick={() => onStartReview('mixed')}
            disabled={!status || status.totalReviewItems === 0}
            className="p-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Play size={20} />
            {t('review.mixedReview')}
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: t('review.overview'), icon: TrendingUp },
            { id: 'mistakes', label: t('review.mistakeBook'), icon: BookOpen },
            { id: 'mastery', label: t('review.mastery'), icon: Brain },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                }
              `}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="bg-[#252536] rounded-2xl p-6">
          {activeTab === 'overview' && status && (
            <div>
              <h3 className="text-white font-bold mb-4">{t('review.weakKnowledgePoints')}</h3>
              {status.weakPoints.length > 0 ? (
                <div className="space-y-3">
                  {status.weakPoints.map(point => (
                    <div
                      key={point.key}
                      className="flex items-center justify-between bg-white/5 rounded-xl p-4"
                    >
                      <div>
                        <p className="text-white font-medium">{point.key}</p>
                        <p className="text-white/50 text-sm">{point.type === 'category' ? t('review.categoryType') : t('review.unitType')}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${point.masteryLevel < 40 ? 'text-red-400' : 'text-orange-400'}`}>
                          {point.masteryLevel}%
                        </p>
                        <p className="text-white/50 text-xs">{t('review.masteryLevel')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/50 text-center py-8">{t('review.noWeakPoints')}</p>
              )}
            </div>
          )}

          {activeTab === 'mistakes' && <MistakeBook />}

          {activeTab === 'mastery' && <WeaknessChart mastery={mastery} />}
        </div>
      </div>
    </div>
  );
}
