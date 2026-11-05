import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { installFakeApi } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { SiteLayout } from './SiteLayout';

const app = (
  <Routes>
    <Route element={<SiteLayout />}>
      <Route path="/" element={<p>홈</p>} />
      <Route path="/reviews/new" element={<p>새 리뷰</p>} />
      <Route path="/login" element={<p>로그인</p>} />
    </Route>
  </Routes>
);

describe('SiteLayout', () => {
  it('본문 바로가기 링크가 있다', () => {
    installFakeApi();
    renderWithProviders(app);
    expect(screen.getByRole('link', { name: '본문 바로가기' })).toHaveAttribute('href', '#main');
  });

  it('운영자에게는 리뷰 쓰기를 보여 주고, 화면을 옮기면 본문으로 초점을 옮긴다', async () => {
    installFakeApi();
    renderWithProviders(app);
    await userEvent.click(await screen.findByRole('link', { name: '리뷰 쓰기' }));
    expect(screen.getByText('새 리뷰')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
    expect(screen.queryByRole('link', { name: '운영자 로그인' })).not.toBeInTheDocument();
  });

  it('방문자에게는 쓰기 메뉴 없이 로그인 링크만 보여 준다', async () => {
    installFakeApi({ isCritic: false });
    renderWithProviders(app);
    expect(await screen.findByRole('link', { name: '운영자 로그인' })).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('link', { name: '리뷰 쓰기' })).not.toBeInTheDocument();
  });
});
