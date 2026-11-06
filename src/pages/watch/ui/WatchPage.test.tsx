import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { activeSubscription, installFakeApi } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { WatchPage } from './WatchPage';

const view = (id = 'last-screening') =>
  renderWithProviders(
    <Routes>
      <Route path="/watch/:id" element={<WatchPage />} />
      <Route path="/login" element={<p>로그인 화면</p>} />
    </Routes>,
    `/watch/${id}`,
  );

describe('WatchPage', () => {
  it('권한이 있으면 자동 재생 없이 플레이어를 보여 준다', async () => {
    installFakeApi({ subscription: activeSubscription('standard') });
    view();
    expect(await screen.findByRole('heading', { level: 1, name: '마지막 상영' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '재생' })).toBeInTheDocument();
    expect(screen.getByText('0:00:00 / 1:52:00')).toBeInTheDocument();
    expect(screen.getByText('FHD')).toBeInTheDocument();
  });

  it('재생 위치를 옮기고 자막과 음소거를 켜고 끈다', async () => {
    const user = userEvent.setup();
    installFakeApi({ subscription: activeSubscription('standard') });
    view();
    const seek = await screen.findByRole('slider', { name: '재생 위치' });
    fireEvent.change(seek, { target: { value: '60' } });
    expect(screen.getByText('0:01:00 / 1:52:00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '재생' }));
    expect(screen.getByRole('button', { name: '일시정지' })).toBeInTheDocument();

    const subtitles = screen.getByRole('button', { name: '자막' });
    expect(subtitles).toHaveAttribute('aria-pressed', 'true');
    await user.click(subtitles);
    expect(subtitles).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByText(/가상 자막/)).not.toBeInTheDocument();
    await act(async () => {});
  });

  it('로그인하지 않으면 로그인 화면으로 보낸다', async () => {
    installFakeApi({ user: null });
    view();
    expect(await screen.findByText('로그인 화면')).toBeInTheDocument();
  });

  it('이용권이 없으면 안내한다', async () => {
    installFakeApi();
    view();
    expect(await screen.findByRole('heading', { name: '이용권이 필요합니다' })).toBeInTheDocument();
  });

  it('없는 작품을 안내한다', async () => {
    installFakeApi();
    view('none');
    expect(await screen.findByRole('heading', { name: '영화를 찾을 수 없습니다' })).toBeInTheDocument();
  });
});
