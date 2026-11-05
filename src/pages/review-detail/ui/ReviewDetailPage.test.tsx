import { screen, waitFor } from '@testing-library/react';
import { get } from 'idb-keyval';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { ReviewDetailPage } from './ReviewDetailPage';

vi.mock('idb-keyval', async (importOriginal) => {
  const actual = await importOriginal<typeof import('idb-keyval')>();
  return { ...actual, get: vi.fn(actual.get) };
});

const renderAt = (path: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/reviews/:id" element={<ReviewDetailPage />} />
    </Routes>,
    path,
  );

describe('ReviewDetailPage', () => {
  it('리뷰와 장면을 대체 텍스트와 함께 보여 준다', async () => {
    renderAt('/reviews/sample-last-screening');
    expect(await screen.findByRole('heading', { level: 1, name: '마지막 상영' })).toBeInTheDocument();
    expect(screen.getByAltText('마지막 상영 포스터')).toBeInTheDocument();
    expect(screen.getByAltText('붉은 노을 아래 지평선 위로 해가 걸린 풍경')).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('마지막 상영 | AboutMovie'));
  });

  it('없는 리뷰를 안내한다', async () => {
    renderAt('/reviews/nope');
    expect(await screen.findByRole('heading', { name: '리뷰를 찾을 수 없습니다' })).toBeInTheDocument();
  });

  it('불러오지 못하면 알린다', async () => {
    vi.mocked(get).mockRejectedValueOnce(new Error('fail'));
    renderAt('/reviews/sample-last-screening');
    expect(await screen.findByRole('alert')).toHaveTextContent('불러오지 못했습니다');
  });
});
