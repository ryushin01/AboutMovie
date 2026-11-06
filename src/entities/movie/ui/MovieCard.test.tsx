import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { sampleMovie } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import type { Movie } from '../model/types';
import { MovieCard } from './MovieCard';

const render = (patch: Partial<Movie>) =>
  renderWithProviders(<MovieCard movie={{ ...(sampleMovie() as unknown as Movie), ...patch }} />);

it('상세로 가는 링크와 포스터 설명이 있다', async () => {
  render({ firstImport: false });
  expect(await screen.findByRole('link', { name: '마지막 상영' })).toHaveAttribute(
    'href',
    '/movies/last-screening',
  );
  expect(screen.getByAltText('마지막 상영 포스터')).toBeInTheDocument();
  expect(screen.queryByText('국내 첫 공개')).not.toBeInTheDocument();
});

it('국내 첫 공개작과 공개 예정작을 글자로 구분한다', async () => {
  render({ firstImport: true });
  expect(await screen.findByText('국내 첫 공개')).toBeInTheDocument();
});

it('공개 예정작에는 공개일을 보여 준다', async () => {
  render({ firstImport: true, releasedOn: '2999-01-15' });
  expect(await screen.findByText('2999.01.15 공개')).toBeInTheDocument();
});
