import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { installFakeApi } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { ReviewEditPage } from './ReviewEditPage';

const renderAt = (path: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/reviews/:id/edit" element={<ReviewEditPage />} />
      <Route path="/login" element={<p>로그인 화면</p>} />
    </Routes>,
    path,
  );

describe('ReviewEditPage', () => {
  it('기존 내용을 채워 보여 준다', async () => {
    installFakeApi();
    renderAt('/reviews/sample-1/edit');
    expect(await screen.findByLabelText('영화 제목 (필수)')).toHaveValue('마지막 상영');
    expect(screen.getByLabelText('평점 (필수)')).toHaveValue('5');
    expect(screen.getByRole('checkbox', { name: '드라마' })).toBeChecked();
    expect(screen.getByRole('link', { name: '취소' })).toHaveAttribute('href', '/reviews/sample-1');
  });

  it('없는 리뷰를 안내한다', async () => {
    installFakeApi();
    renderAt('/reviews/nope/edit');
    expect(await screen.findByRole('heading', { name: '리뷰를 찾을 수 없습니다' })).toBeInTheDocument();
  });

  it('방문자는 로그인 화면으로 보낸다', async () => {
    installFakeApi({ isCritic: false });
    renderAt('/reviews/sample-1/edit');
    expect(await screen.findByText('로그인 화면')).toBeInTheDocument();
  });
});
