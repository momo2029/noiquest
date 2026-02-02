import { useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

// 配置
const HEARTBEAT_INTERVAL = 60 * 1000; // 心跳间隔：1分钟
const IDLE_TIMEOUT = 3 * 60 * 1000; // 空闲超时：3分钟

/**
 * 学习时间追踪 Hook
 *
 * 功能：
 * 1. 检测用户活动（鼠标、键盘、点击、滚动）
 * 2. 用户活跃时每分钟上报一次心跳
 * 3. 超过3分钟无活动则暂停计时
 */
export function useStudyTracker(enabled: boolean = true) {
  const isActiveRef = useRef(true);
  const lastActivityRef = useRef(Date.now());
  const heartbeatTimerRef = useRef<number | null>(null);
  const idleCheckTimerRef = useRef<number | null>(null);

  // 重置活动状态
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (!isActiveRef.current) {
      isActiveRef.current = true;
      console.log('[StudyTracker] 用户恢复活跃');
    }
  }, []);

  // 发送心跳
  const sendHeartbeat = useCallback(async () => {
    if (!isActiveRef.current) {
      console.log('[StudyTracker] 用户空闲，跳过心跳');
      return;
    }

    try {
      await api.sendStudyHeartbeat(1);
      console.log('[StudyTracker] 心跳已发送');
    } catch (error) {
      console.error('[StudyTracker] 心跳发送失败:', error);
    }
  }, []);

  // 检查空闲状态
  const checkIdle = useCallback(() => {
    const idleTime = Date.now() - lastActivityRef.current;
    if (idleTime >= IDLE_TIMEOUT && isActiveRef.current) {
      isActiveRef.current = false;
      console.log('[StudyTracker] 用户进入空闲状态');
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // 活动事件监听
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetActivity();
    };

    // 添加事件监听
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // 启动心跳定时器
    heartbeatTimerRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // 启动空闲检查定时器
    idleCheckTimerRef.current = window.setInterval(checkIdle, 10 * 1000); // 每10秒检查一次

    // 页面可见性变化处理
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
        console.log('[StudyTracker] 页面隐藏，暂停计时');
      } else {
        resetActivity();
        console.log('[StudyTracker] 页面可见，恢复计时');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    console.log('[StudyTracker] 学习时间追踪已启动');

    // 清理
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });

      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }

      if (idleCheckTimerRef.current) {
        clearInterval(idleCheckTimerRef.current);
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange);

      console.log('[StudyTracker] 学习时间追踪已停止');
    };
  }, [enabled, resetActivity, sendHeartbeat, checkIdle]);
}
