import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Clock, BookOpen, ChevronRight, Check, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { SkillUnit } from '../../types';
import LearningContent from './LearningContent';

interface KnowledgeLearningPageProps {
  unitId: string;
  onBack: () => void;
  onNavigateToSkillTree: () => void;
}

export default function KnowledgeLearningPage({
  unitId,
  onBack,
  onNavigateToSkillTree,
}: KnowledgeLearningPageProps) {
  const { t } = useTranslation();
  const [unit, setUnit] = useState<SkillUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'content' | 'examples' | 'tips' | 'mistakes'>('content');

  useEffect(() => {
    loadUnit();
  }, [unitId]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSkillUnit(unitId);
      setUnit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const hasContent = unit?.content || (unit?.tips && unit.tips.length > 0) ||
    (unit?.codeExamples && unit.codeExamples.length > 0) ||
    (unit?.commonMistakes && unit.commonMistakes.length > 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || t('common.error')}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            {t('learning.backToGraph')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{unit.icon}</span>
                <h1 className="text-xl font-bold text-white truncate">{unit.title}</h1>
              </div>
              <p className="text-sm text-gray-400 truncate">{unit.moduleName}</p>
            </div>
            {unit.estimatedTime && (
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <Clock size={16} />
                <span>{unit.estimatedTime} {t('common.minutes')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-shrink-0 bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            <TabButton
              active={activeSection === 'content'}
              onClick={() => setActiveSection('content')}
              icon={<FileText size={16} />}
              label={t('learning.contentSections.content')}
            />
            {unit.codeExamples && unit.codeExamples.length > 0 && (
              <TabButton
                active={activeSection === 'examples'}
                onClick={() => setActiveSection('examples')}
                icon={<BookOpen size={16} />}
                label={t('learning.contentSections.examples')}
              />
            )}
            {unit.tips && unit.tips.length > 0 && (
              <TabButton
                active={activeSection === 'tips'}
                onClick={() => setActiveSection('tips')}
                icon={<Check size={16} />}
                label={t('learning.contentSections.tips')}
              />
            )}
            {unit.commonMistakes && unit.commonMistakes.length > 0 && (
              <TabButton
                active={activeSection === 'mistakes'}
                onClick={() => setActiveSection('mistakes')}
                icon={<BookOpen size={16} />}
                label={t('learning.contentSections.mistakes')}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {!hasContent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{t('learning.noContent')}</h3>
              <p className="text-gray-400">{t('learning.noContentDesc')}</p>
            </div>
          ) : (
            <>
              {activeSection === 'content' && (
                <LearningContent
                  content={unit.content}
                  videoUrl={unit.videoUrl}
                  references={unit.references}
                />
              )}
              {activeSection === 'examples' && (
                <LearningContent codeExamples={unit.codeExamples} />
              )}
              {activeSection === 'tips' && (
                <LearningContent tips={unit.tips} />
              )}
              {activeSection === 'mistakes' && (
                <LearningContent commonMistakes={unit.commonMistakes} />
              )}
            </>
          )}
        </div>
      </div>

      
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
        ${active
          ? 'bg-cyan-500/20 text-cyan-400'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
