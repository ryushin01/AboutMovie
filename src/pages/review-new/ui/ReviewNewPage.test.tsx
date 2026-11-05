import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { installFakeApi } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { ReviewNewPage } from './ReviewNewPage';

const app = (
  <Routes>
    <Route path="/reviews/new" element={<ReviewNewPage />} />
    <Route path="/login" element={<p>로그인 화면</p>} />
  </Routes>
);

describe('ReviewNewPage', () => {
  it('운영자에게 빈 작성 폼을 보여 준다', async () => {
    installFakeApi();
    renderWithProviders(app, '/reviews/new');
    expect(await screen.findByRole('heading', { level: 1, name: '리뷰 쓰기' })).toBeInTheDocument();
    expect(screen.getByLabelText('영화 제목 (필수)')).toHaveValue('');
    await waitFor(() => expect(document.title).toBe('리뷰 쓰기 | AboutMovie'));
  });

  it('방문자는 로그인 화면으로 보낸다', async () => {
    installFakeApi({ isCritic: false });
    renderWithProviders(app, '/reviews/new');
    expect(await screen.findByText('로그인 화면')).toBeInTheDocument();
  });
});
