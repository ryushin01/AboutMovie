import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { installFakeApi } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { SiteLayout } from './SiteLayout';

function Where() {
  const { pathname, search } = useLocation();
  return <p>위치: {decodeURIComponent(pathname + search)}</p>;
}

const app = (
  <Routes>
    <Route element={<SiteLayout />}>
      <Route path="*" element={<Where />} />
    </Route>
  </Routes>
);

describe('SiteLayout', () => {
  it('본문 바로가기 링크가 있다', () => {
    installFakeApi();
    renderWithProviders(app);
    expect(screen.getByRole('link', { name: '본문 바로가기' })).toHaveAttribute('href', '#main');
  });

  it('회원에게는 내 계정을 보여 주고, 화면을 옮기면 본문으로 초점을 옮긴다', async () => {
    installFakeApi();
    renderWithProviders(app);
    await userEvent.click(await screen.findByRole('link', { name: '내 계정' }));
    expect(screen.getByText('위치: /account')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
    expect(screen.queryByRole('link', { name: '회원가입' })).not.toBeInTheDocument();
  });

  it('방문자에게는 로그인과 회원가입을 보여 준다', async () => {
    installFakeApi({ user: null });
    renderWithProviders(app);
    expect(await screen.findByRole('link', { name: '회원가입' })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login');
  });

  it('머리글 검색은 리스트로 이동한다', async () => {
    installFakeApi();
    renderWithProviders(app);
    await userEvent.type(screen.getByLabelText('영화 검색'), '항구{Enter}');
    expect(screen.getByText('위치: /movies?q=항구')).toBeInTheDocument();
  });
});
