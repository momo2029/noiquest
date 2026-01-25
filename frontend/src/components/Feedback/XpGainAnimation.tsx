import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface XpGainAnimationProps {
  amount: number;
  onComplete?: () => void;
}

export default function XpGainAnimation({ amount, onComplete }: XpGainAnimationProps) {
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState({ y: 0, opacity: 1 });

  useEffect(() => {
    // 动画效果
    const timer = setTimeout(() => {
      setPosition({ y: -50, opacity: 0 });
    }, 100);

    const hideTimer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
      style={{
        transform: `translate(-50%, calc(-50% + ${position.y}px))`,
        opacity: position.opacity,
        transition: 'all 0.8s ease-out',
      }}
    >
      <div className="flex items-center gap-2 bg-yellow-500 text-yellow-900 px-6 py-3 rounded-full shadow-lg">
        <Zap size={24} className="animate-pulse" />
        <span className="text-2xl font-black">+{amount} XP</span>
      </div>
    </div>
  );
}
