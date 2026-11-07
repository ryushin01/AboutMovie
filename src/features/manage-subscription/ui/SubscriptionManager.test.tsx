import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Subscription } from '@/entities/subscription';
import { installFakeApi } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { SubscriptionManager } from './SubscriptionManager';

const subscription: Subscription = {
  plan: 'standard',
  pendingPlan: null,
  status: 'active',
  cancelAtPeriodEnd: false,
  startedAt: '2026-11-06T00:00:00.000Z',
  currentPeriodEnd: '2026-12-06T00:00:00.000Z',
};
const patches = (state: ReturnType<typeof installFakeApi>['state']) =>
  state.calls.filter((call) => call.method === 'PATCH').map((call) => call.body);

describe('SubscriptionManager', () => {
  it('상위 이용권은 차액을 알리고 하위 이용권은 낮추기로 보여 준다', async () => {
    const { state } = installFakeApi();
    await renderWithProviders(<SubscriptionManager subscription={subscription} />);

    expect(await screen.findByRole('button', { name: '베이직(으)로 낮추기' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /프리미엄\(으\)로 올리기 \(차액 3,000원/ }));

    await waitFor(() => expect(patches(state)).toEqual([{ action: 'change', plan: 'premium' }]));
  });

  it('해지는 확인을 거치고, 취소하면 요청하지 않는다', async () => {
    const { state } = installFakeApi();
    const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    vi.stubGlobal('confirm', confirm);
    await renderWithProviders(<SubscriptionManager subscription={subscription} />);

    await userEvent.click(screen.getByRole('button', { name: '해지하기' }));
    expect(patches(state)).toEqual([]);

    await userEvent.click(screen.getByRole('button', { name: '해지하기' }));
    await waitFor(() => expect(patches(state)).toEqual([{ action: 'cancel' }]));
  });

  it('해지 예약 중에는 해지 취소만 할 수 있다', async () => {
    const { state } = installFakeApi();
    await renderWithProviders(
      <SubscriptionManager subscription={{ ...subscription, cancelAtPeriodEnd: true }} />,
    );

    expect(screen.getByText(/2026년 12월 6일에 해지됩니다/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /올리기/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '해지 취소' }));
    await waitFor(() => expect(patches(state)).toEqual([{ action: 'resume' }]));
  });

  it('변경 예약을 안내하고 취소할 수 있다', async () => {
    const { state } = installFakeApi();
    await renderWithProviders(
      <SubscriptionManager subscription={{ ...subscription, pendingPlan: 'basic' }} />,
    );

    expect(screen.getByText('다음 결제일부터 베이직 이용권으로 바뀝니다.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '변경 예약 취소' }));
    await waitFor(() => expect(patches(state)).toEqual([{ action: 'change', plan: 'standard' }]));
  });

  it('실패하면 안내한다', async () => {
    const { state } = installFakeApi();
    state.fail = (method) => method === 'PATCH';
    await renderWithProviders(<SubscriptionManager subscription={subscription} />);
    await userEvent.click(screen.getByRole('button', { name: '베이직(으)로 낮추기' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('처리하지 못했습니다');
  });
});
