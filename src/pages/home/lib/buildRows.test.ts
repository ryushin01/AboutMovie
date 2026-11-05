import { describe, expect, it } from 'vitest';
import type { Review } from '@/entities/review';
import { buildRows } from './buildRows';

const review = (id: string, rating: number, ...genres: Review['genres']): Review => ({
  id,
  title: id,
  year: 2025,
  rating,
  genres,
  poster: '/seed/a.svg',
  body: { type: 'doc' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('buildRows', () => {
  it('최신, 추천, 장르 순서로 만들고 빈 장르는 뺀다', () => {
    const rows = buildRows([review('a', 3, '드라마'), review('b', 5, 'SF'), review('c', 4, '드라마')]);
    expect(rows.map((row) => row.title)).toEqual(['최신 리뷰', '평론가 추천', '드라마', 'SF']);
    expect(rows[1].reviews.map((r) => r.id)).toEqual(['b', 'c']);
    expect(rows[2].reviews.map((r) => r.id)).toEqual(['a', 'c']);
  });

  it('장르가 여럿인 글은 각 장르 줄에 모두 나온다', () => {
    const rows = buildRows([review('a', 3, '드라마', 'SF')]);
    expect(rows.map((row) => row.title)).toEqual(['최신 리뷰', '드라마', 'SF']);
  });

  it('추천할 글이 없으면 추천 줄도 뺀다', () => {
    expect(buildRows([review('a', 2, '코미디')]).map((row) => row.title)).toEqual(['최신 리뷰', '코미디']);
  });

  it('글이 없으면 줄도 없다', () => {
    expect(buildRows([])).toEqual([]);
  });
});
