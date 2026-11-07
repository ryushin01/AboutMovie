import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { installFakeApi } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { WatchlistButton } from './WatchlistButton';

describe('WatchlistButton', () => {
  it('누를 때마다 찜하고 빼며 눌림 상태를 알린다', async () => {
    const { state } = installFakeApi();
    await renderWithProviders(<WatchlistButton movieId="last-screening" />);
    const button = await screen.findByRole('button', { name: '찜하기' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'));
    expect(state.calls.some((call) => call.method === 'PUT')).toBe(true);

    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'false'));
    expect(state.calls.some((call) => call.method === 'DELETE')).toBe(true);
  });

  it('방문자는 돌아올 주소와 함께 로그인으로 보낸다', async () => {
    installFakeApi({ user: null });
    await renderWithProviders(<WatchlistButton movieId="last-screening" />);
    expect(await screen.findByRole('link', { name: '찜하기' })).toHaveAttribute(
      'href',
      `/login?next=${encodeURIComponent('/movies/last-screening')}`,
    );
  });

  it('실패하면 안내한다', async () => {
    const { state } = installFakeApi();
    state.fail = (method) => method === 'PUT';
    await renderWithProviders(<WatchlistButton movieId="last-screening" />);
    await userEvent.click(await screen.findByRole('button', { name: '찜하기' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('바꾸지 못했습니다');
  });
});
