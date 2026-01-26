import { useState, useEffect, useCallback } from 'react';
import { Heart, Clock, Gem, X } from 'lucide-react';
import { api } from '../../services/api';

interface HeartsDisplayProps {
  hearts: number;
  maxHearts?: number;
  onHeartsChange?: (hearts: number) => void;
}

interface HeartsStatus {
  hearts: number;
  maxHearts: number;
  nextRecoveryIn: number | null;
  fullRecoveryIn: number | null;
  canStartLesson: boolean;
  prices: { single: number; full: number };
  userGems: number;
}

export default function HeartsDisplay({ hearts: initialHearts, maxHearts = 5, onHeartsChange }: HeartsDisplayProps) {
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<HeartsStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // 获取心数状态
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getHeartsStatus();
      setStatus(data);
      setCountdown(data.nextRecoveryIn);
      if (onHeartsChange && data.hearts !== initialHearts) {
        onHeartsChange(data.hearts);
      }
    } catch (error) {
      console.error('获取心数状态失败:', error);
    } finally {
      setLoading(false);
    }
  }, [initialHearts, onHeartsChange]);

  // 打开弹窗时获取最新状态
  useEffect(() => {
    if (showModal) {
      fetchStatus();
    }
  }, [showModal, fetchStatus]);

  // 倒计时
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          // 倒计时结束，刷新状态
          fetchStatus();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, fetchStatus]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // 购买心
  const handlePurchase = async (type: 'single' | 'full') => {
    try {
      setPurchasing(true);
      const result = await api.purchaseHearts(type);
      if (result.success) {
        setStatus(prev => prev ? {
          ...prev,
          hearts: result.hearts,
          userGems: result.gemsRemaining,
          nextRecoveryIn: null,
          fullRecoveryIn: null,
        } : null);
        if (onHeartsChange) {
          onHeartsChange(result.hearts);
        }
      }
    } catch (error: any) {
      alert(error.message || '购买失败');
    } finally {
      setPurchasing(false);
    }
  };

  const currentHearts = status?.hearts ?? initialHearts;
  const currentMaxHearts = status?.maxHearts ?? maxHearts;

  return (
    <>
      {/* 心数显示按钮 */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl hover:bg-white/20 transition-colors"
        title="点击查看详情"
      >
        <Heart className="text-red-300" size={20} />
        <span className="text-white font-bold">{currentHearts}</span>
      </button>

      {/* 弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[400px] shadow-2xl">
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Heart className="text-red-500" size={24} />
                生命值
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              ) : (
                <>
                  {/* 心数显示 */}
                  <div className="flex justify-center gap-2 mb-6">
                    {Array.from({ length: currentMaxHearts }).map((_, i) => (
                      <Heart
                        key={i}
                        size={32}
                        className={i < currentHearts ? 'text-red-500 fill-red-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>

                  {/* 恢复倒计时 */}
                  {countdown !== null && countdown > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={18} />
                          <span>下一颗心恢复</span>
                        </div>
                        <span className="font-bold text-gray-800">{formatTime(countdown)}</span>
                      </div>
                      {status?.fullRecoveryIn && status.fullRecoveryIn > countdown && (
                        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                          <span>全部恢复</span>
                          <span>{formatTime(status.fullRecoveryIn)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 满心提示 */}
                  {currentHearts >= currentMaxHearts && (
                    <div className="bg-green-50 text-green-700 rounded-xl p-4 mb-6 text-center">
                      生命值已满！
                    </div>
                  )}

                  {/* 购买选项 */}
                  {currentHearts < currentMaxHearts && status && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 text-center mb-4">
                        当前宝石: <Gem className="inline text-blue-500" size={14} /> {status.userGems}
                      </p>

                      {/* 购买单个心 */}
                      <button
                        onClick={() => handlePurchase('single')}
                        disabled={purchasing || status.userGems < status.prices.single}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3">
                          <Heart className="text-red-500 fill-red-500" size={24} />
                          <span className="font-medium">购买 1 心</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-bold">
                          <Gem size={16} />
                          {status.prices.single}
                        </div>
                      </button>

                      {/* 补满全部 */}
                      <button
                        onClick={() => handlePurchase('full')}
                        disabled={purchasing || status.userGems < status.prices.full}
                        className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex">
                            {Array.from({ length: currentMaxHearts }).map((_, i) => (
                              <Heart key={i} className="text-red-500 fill-red-500 -ml-1 first:ml-0" size={20} />
                            ))}
                          </div>
                          <span className="font-medium">补满全部</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-bold">
                          <Gem size={16} />
                          {status.prices.full}
                        </div>
                      </button>

                      {status.userGems < status.prices.single && (
                        <p className="text-sm text-red-500 text-center mt-4">
                          宝石不足，无法购买
                        </p>
                      )}
                    </div>
                  )}

                  {/* 说明 */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center">
                      生命值每小时自动恢复 1 颗，最多 {currentMaxHearts} 颗
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
