import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { SiteLayout } from './SiteLayout';

const app = (
  <Routes>
    <Route element={<SiteLayout />}>
      <Route path="/" element={<p>홈</p>} />
      <Route path="/reviews/new" element={<p>새 리뷰</p>} />
    </Route>
  </Routes>
);

describe('SiteLayout', () => {
  it('본문 바로가기 링크가 있다', () => {
    renderWithProviders(app);
    expect(screen.getByRole('link', { name: '본문 바로가기' })).toHaveAttribute('href', '#main');
  });

  it('화면을 옮기면 본문으로 초점을 옮긴다', async () => {
    renderWithProviders(app);
    await userEvent.click(screen.getByRole('link', { name: '리뷰 쓰기' }));
    expect(screen.getByText('새 리뷰')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
  });
});
