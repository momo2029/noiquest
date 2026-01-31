import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { CodeExample, Reference } from '../../types';
import { Code, ExternalLink, Lightbulb, AlertTriangle, Play } from 'lucide-react';

interface LearningContentProps {
  content?: string;
  codeExamples?: CodeExample[];
  tips?: string[];
  commonMistakes?: string[];
  references?: Reference[];
  videoUrl?: string;
}

export default function LearningContent({
  content,
  codeExamples,
  tips,
  commonMistakes,
  references,
  videoUrl,
}: LearningContentProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Markdown Content */}
      {content && (
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;

                if (isInline) {
                  return (
                    <code className="bg-white/10 px-1.5 py-0.5 rounded text-cyan-400" {...props}>
                      {children}
                    </code>
                  );
                }

                return (
                  <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className={`language-${match[1]} text-sm`} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold text-white mb-3 mt-6">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-300">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-gray-400 my-4">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}

      {/* Code Examples */}
      {codeExamples && codeExamples.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Code size={20} className="text-cyan-400" />
            {t('learning.codeExamples')}
          </h3>
          {codeExamples.map((example, index) => (
            <div key={index} className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-sm font-medium text-gray-300">{example.title}</span>
                <span className="text-xs text-gray-500">{example.language}</span>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-gray-300">{example.code}</code>
              </pre>
              {example.explanation && (
                <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700">
                  <p className="text-sm text-gray-400">{example.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {tips && tips.length > 0 && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 mb-3">
            <Lightbulb size={20} />
            {t('learning.learningPoints')}
          </h3>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-300">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Common Mistakes */}
      {commonMistakes && commonMistakes.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2 mb-3">
            <AlertTriangle size={20} />
            {t('learning.commonMistakes')}
          </h3>
          <ul className="space-y-2">
            {commonMistakes.map((mistake, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-300">
                <span className="text-orange-400 mt-1">•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Video Tutorial */}
      {videoUrl && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2 mb-3">
            <Play size={20} />
            {t('learning.videoTutorial')}
          </h3>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ExternalLink size={16} />
            <span>{t('learning.videoTutorial')}</span>
          </a>
        </div>
      )}

      {/* References */}
      {references && references.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <ExternalLink size={20} className="text-gray-400" />
            {t('learning.references')}
          </h3>
          <ul className="space-y-2">
            {references.map((ref, index) => (
              <li key={index}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>{ref.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
