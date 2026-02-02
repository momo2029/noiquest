import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeartsDisplay from '../../src/components/Hearts/HeartsDisplay';

// Mock API
vi.mock('../../src/services/api', () => ({
  api: {
    getHeartsStatus: vi.fn().mockResolvedValue({
      hearts: 4, // 返回不同的值以触发 onHeartsChange
      maxHearts: 5,
      nextRecoveryIn: 1800,
      fullRecoveryIn: 5400,
      canStartLesson: true,
      prices: { single: 50, full: 100 },
      userGems: 200,
    }),
    purchaseHearts: vi.fn().mockResolvedValue({
      success: true,
      hearts: 5,
      gemsRemaining: 150,
    }),
  },
}));

describe('HeartsDisplay', () => {
  it('应正确渲染心数', () => {
    render(<HeartsDisplay hearts={3} maxHearts={5} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('点击后应显示弹窗', async () => {
    const user = userEvent.setup();
    render(<HeartsDisplay hearts={3} maxHearts={5} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByText('生命值')).toBeInTheDocument();
  });

  it('当 API 返回不同心数时应调用 onHeartsChange', async () => {
    const onHeartsChange = vi.fn();
    const user = userEvent.setup();

    render(
      <HeartsDisplay
        hearts={3} // 初始值为 3，API 返回 4
        maxHearts={5}
        onHeartsChange={onHeartsChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // 等待 API 调用完成并触发回调
    await waitFor(() => {
      expect(onHeartsChange).toHaveBeenCalledWith(4);
    });
  });
});
