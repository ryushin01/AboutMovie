import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { installFakeApi } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('시네필 소개와 대표작, 작품 줄을 보여 준다', async () => {
    installFakeApi();
    renderWithProviders(<HomePage />);
    expect(
      await screen.findByRole('heading', { level: 1, name: /시네필을 위한 영화 전문 OTT/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '마지막 상영' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '국내 첫 공개' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '자세히 보기: 마지막 상영' })).toHaveAttribute(
      'href',
      '/movies/last-screening',
    );
  });

  it('장르 링크는 리스트의 필터로 간다', async () => {
    installFakeApi();
    renderWithProviders(<HomePage />);
    const nav = await screen.findByRole('navigation', { name: '장르별 영화' });
    expect(nav.querySelector('a[href="/movies?genre=SF"]')).toBeInTheDocument();
  });

  it('불러오지 못하면 안내한다', async () => {
    const { state } = installFakeApi();
    state.fail = () => true;
    renderWithProviders(<HomePage />);
    expect(await screen.findByRole('alert', {}, { timeout: 2000 })).toHaveTextContent('불러오지 못했습니다');
  });

  it('작품이 없으면 안내한다', async () => {
    installFakeApi({ movies: [] });
    renderWithProviders(<HomePage />);
    expect(await screen.findByRole('heading', { name: '아직 공개된 영화가 없습니다' })).toBeInTheDocument();
  });
});
