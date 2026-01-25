import { useEffect, useState } from 'react';
import { HeartCrack } from 'lucide-react';

interface HeartLostAnimationProps {
  onComplete?: () => void;
}

export default function HeartLostAnimation({ onComplete }: HeartLostAnimationProps) {
  const [visible, setVisible] = useState(true);
  const [shake, setShake] = useState(true);

  useEffect(() => {
    // 震动效果
    const shakeTimer = setTimeout(() => setShake(false), 500);

    // 隐藏
    const hideTimer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1000);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
      <div
        className={`
          flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg
          ${shake ? 'animate-shake' : ''}
        `}
      >
        <HeartCrack size={24} />
        <span className="text-xl font-bold">-1</span>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.1s ease-in-out 3;
        }
      `}</style>
    </div>
  );
}
