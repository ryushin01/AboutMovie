import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { installFakeApi, sampleReview } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('대표 리뷰와 장르별 줄을 보여 준다', async () => {
    installFakeApi({
      reviews: [sampleReview(), sampleReview({ id: 'b', title: '유리 궤도', genre: 'SF', rating: 3 })],
    });
    renderWithProviders(<HomePage />);

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('ABOUT MOVIE');
    expect(screen.getByRole('heading', { level: 2, name: '마지막 상영' })).toBeInTheDocument();
    for (const row of ['최신 리뷰', '평론가 추천', '드라마', 'SF']) {
      expect(screen.getByRole('heading', { level: 2, name: row })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('link', { name: '유리 궤도' })[0]).toHaveAttribute('href', '/reviews/b');
  });

  it('리뷰가 없으면 방문자에게는 안내만 보여 준다', async () => {
    installFakeApi({ reviews: [], isCritic: false });
    renderWithProviders(<HomePage />);
    expect(await screen.findByText('아직 공개된 리뷰가 없습니다.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '첫 리뷰 쓰기' })).not.toBeInTheDocument();
  });

  it('리뷰가 없으면 운영자에게는 작성으로 안내한다', async () => {
    installFakeApi({ reviews: [] });
    renderWithProviders(<HomePage />);
    expect(await screen.findByRole('link', { name: '첫 리뷰 쓰기' })).toHaveAttribute('href', '/reviews/new');
  });

  it('불러오지 못하면 알린다', async () => {
    const { state } = installFakeApi();
    state.fail = (_method, path) => path === '/api/reviews';
    renderWithProviders(<HomePage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('불러오지 못했습니다');
  });
});
