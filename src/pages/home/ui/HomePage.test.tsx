import { screen } from '@testing-library/react';
import { entries } from 'idb-keyval';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { HomePage } from './HomePage';

vi.mock('idb-keyval', async (importOriginal) => {
  const actual = await importOriginal<typeof import('idb-keyval')>();
  return { ...actual, entries: vi.fn(actual.entries) };
});

describe('HomePage', () => {
  it('리뷰 목록과 개수를 보여 준다', async () => {
    renderWithProviders(<HomePage />);
    expect(await screen.findByRole('link', { name: '마지막 상영' })).toBeInTheDocument();
    expect(screen.getByText('리뷰 3편')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ABOUT MOVIE');
  });

  it('리뷰가 없으면 작성으로 안내한다', async () => {
    vi.mocked(entries).mockResolvedValueOnce([]);
    renderWithProviders(<HomePage />);
    expect(await screen.findByRole('link', { name: '첫 리뷰 쓰기' })).toHaveAttribute('href', '/reviews/new');
  });

  it('불러오지 못하면 알린다', async () => {
    vi.mocked(entries).mockRejectedValueOnce(new Error('fail'));
    renderWithProviders(<HomePage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('불러오지 못했습니다');
  });
});
