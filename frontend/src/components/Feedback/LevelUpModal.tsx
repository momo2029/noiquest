import { useEffect, useState } from 'react';
import { Star, Sparkles, Trophy } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

export default function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 显示动画
    setTimeout(() => setShow(true), 100);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      {/* 彩带效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-8 animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-20px',
              backgroundColor: ['#fbbf24', '#f472b6', '#60a5fa', '#34d399', '#a78bfa'][i % 5],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`
          bg-gradient-to-b from-yellow-500 to-orange-500 rounded-3xl p-8 text-center
          transform transition-all duration-500 relative z-10
          ${show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
        `}
      >
        {/* 星星装饰 */}
        <div className="relative">
          <Sparkles className="absolute -top-4 -left-4 text-yellow-200 animate-pulse" size={32} />
          <Sparkles className="absolute -top-4 -right-4 text-yellow-200 animate-pulse" size={32} />
        </div>

        {/* 奖杯图标 */}
        <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Trophy size={48} className="text-yellow-800" />
        </div>

        {/* 标题 */}
        <h2 className="text-3xl font-black text-white mb-2">升级了！</h2>

        {/* 等级显示 */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="text-yellow-200 fill-yellow-200" size={24} />
          <span className="text-5xl font-black text-white">{level}</span>
          <Star className="text-yellow-200 fill-yellow-200" size={24} />
        </div>

        <p className="text-white/80 mb-6">继续努力，解锁更多内容！</p>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="px-8 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors"
        >
          太棒了！
        </button>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
