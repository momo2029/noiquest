import { useState } from 'react';
import { Gem, Gift, X, Check, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface GemsDisplayProps {
  gems: number;
  onGemsChange?: (gems: number) => void;
}

export default function GemsDisplay({ gems: initialGems, onGemsChange }: GemsDisplayProps) {
  const [showModal, setShowModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    type?: string;
    value?: number;
  } | null>(null);
  const [currentGems, setCurrentGems] = useState(initialGems);

  // 兑换码兑换
  const handleRedeem = async () => {
    if (!redeemCode.trim()) return;

    try {
      setRedeeming(true);
      setResult(null);
      const response = await api.redeemCode(redeemCode.trim());

      if (response.success) {
        setResult({
          success: true,
          message: response.message,
          type: response.type,
          value: response.value,
        });
        setRedeemCode('');

        // 更新宝石数量
        if (response.user) {
          setCurrentGems(response.user.gems);
          if (onGemsChange) {
            onGemsChange(response.user.gems);
          }
        }
      } else {
        setResult({
          success: false,
          message: response.message,
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || '兑换失败',
      });
    } finally {
      setRedeeming(false);
    }
  };

  // 获取奖励类型显示
  const getRewardDisplay = (type: string, value: number) => {
    switch (type) {
      case 'GEMS':
        return { icon: <Gem className="text-blue-500" size={24} />, text: `${value} 宝石` };
      case 'HEARTS':
        return { icon: <span className="text-2xl">❤️</span>, text: `${value} 心` };
      case 'STREAK_PROTECT':
        return { icon: <span className="text-2xl">🛡️</span>, text: 'Streak 保护' };
      default:
        return { icon: <Gift className="text-purple-500" size={24} />, text: '奖励' };
    }
  };

  return (
    <>
      {/* 宝石显示按钮 */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl hover:bg-white/20 transition-colors"
        title="点击兑换宝石"
      >
        <Gem className="text-blue-300" size={20} />
        <span className="text-white font-bold">{currentGems}</span>
      </button>

      {/* 弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[400px] shadow-2xl">
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Gem className="text-blue-500" size={24} />
                宝石
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setResult(null);
                  setRedeemCode('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6">
              {/* 当前宝石数量 */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 mb-6 text-center text-white">
                <p className="text-sm opacity-80 mb-1">当前宝石</p>
                <div className="flex items-center justify-center gap-2">
                  <Gem size={32} />
                  <span className="text-4xl font-bold">{currentGems}</span>
                </div>
              </div>

              {/* 兑换码输入 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Gift className="inline mr-1" size={16} />
                  兑换码
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    placeholder="输入兑换码"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                  />
                  <button
                    onClick={handleRedeem}
                    disabled={redeeming || !redeemCode.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {redeeming ? '兑换中...' : '兑换'}
                  </button>
                </div>
              </div>

              {/* 兑换结果 */}
              {result && (
                <div
                  className={`p-4 rounded-xl ${
                    result.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="text-green-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">{result.message}</p>
                          {result.type && result.value && (
                            <div className="flex items-center gap-1 mt-1 text-green-600">
                              {getRewardDisplay(result.type, result.value).icon}
                              <span>{getRewardDisplay(result.type, result.value).text}</span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="text-red-600" size={20} />
                        </div>
                        <p className="font-medium text-red-800">{result.message}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 获取宝石方式 */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">获取宝石的方式</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs">✨</span>
                    <span>完成课程获得宝石奖励</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs">🔥</span>
                    <span>连续学习达到里程碑</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs">🏆</span>
                    <span>解锁成就获得奖励</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">📋</span>
                    <span>完成每日任务</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
