import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { ReviewEditPage } from './ReviewEditPage';

const renderAt = (path: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/reviews/:id/edit" element={<ReviewEditPage />} />
    </Routes>,
    path,
  );

describe('ReviewEditPage', () => {
  it('기존 내용을 채워 보여 준다', async () => {
    renderAt('/reviews/sample-last-screening/edit');
    expect(await screen.findByLabelText('영화 제목 (필수)')).toHaveValue('마지막 상영');
    expect(screen.getByLabelText('평점 (필수)')).toHaveValue('5');
    expect(screen.getByRole('link', { name: '취소' })).toHaveAttribute(
      'href',
      '/reviews/sample-last-screening',
    );
  });

  it('없는 리뷰를 안내한다', async () => {
    renderAt('/reviews/nope/edit');
    expect(await screen.findByRole('heading', { name: '리뷰를 찾을 수 없습니다' })).toBeInTheDocument();
  });
});
