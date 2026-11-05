import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { installFakeApi, sampleReview } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { GenrePage } from './GenrePage';

const renderAt = (path: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/genres/:genre" element={<GenrePage />} />
    </Routes>,
    path,
  );

const reviews = [
  sampleReview({ id: 'a', title: '둘 다', genres: ['드라마', 'SF'] }),
  sampleReview({ id: 'b', title: '우주만', genres: ['SF'] }),
  sampleReview({ id: 'c', title: '드라마만', genres: ['드라마'] }),
];

describe('GenrePage', () => {
  it('그 장르가 붙은 리뷰만 보여 준다', async () => {
    installFakeApi({ reviews });
    renderAt('/genres/SF');
    expect(await screen.findByRole('heading', { level: 2, name: '리뷰 2편' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'SF 리뷰' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '둘 다' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '우주만' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '드라마만' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'SF' })).toHaveAttribute('aria-current', 'page');
    await waitFor(() => expect(document.title).toBe('SF 리뷰 | AboutMovie'));
  });

  it('공백이 있는 장르 주소도 연다', async () => {
    installFakeApi({ reviews: [sampleReview({ genres: ['TV 영화'] })] });
    renderAt('/genres/TV%20%EC%98%81%ED%99%94');
    expect(await screen.findByRole('heading', { level: 2, name: '리뷰 1편' })).toBeInTheDocument();
  });

  it('글이 없는 장르는 비어 있다고 안내한다', async () => {
    installFakeApi({ reviews });
    renderAt('/genres/서부');
    expect(await screen.findByText('이 장르의 리뷰는 아직 없습니다.')).toBeInTheDocument();
  });

  it('없는 장르는 찾을 수 없다고 안내한다', () => {
    installFakeApi({ reviews });
    renderAt('/genres/없는장르');
    expect(screen.getByRole('heading', { level: 1, name: '장르를 찾을 수 없습니다' })).toBeInTheDocument();
  });
});
