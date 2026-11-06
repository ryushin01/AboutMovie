import { describe, expect, it } from 'vitest';
import { parseMovieFilters, toMovieQuery } from './filters';

const parse = (query: string) => parseMovieFilters(new URLSearchParams(query));

describe('parseMovieFilters', () => {
  it('올바른 조건을 읽는다', () => {
    expect(
      parse('q=항구&genre=SF&year=2026&age=15&runtime=short&status=now&firstImport=true&sort=title&page=2'),
    ).toMatchObject({
      q: '항구',
      genre: 'SF',
      year: 2026,
      age: '15',
      runtime: 'short',
      status: 'now',
      firstImport: true,
      sort: 'title',
      page: 2,
    });
  });
  it('잘못된 값은 버린다', () => {
    const invalid = parse(
      'genre=TV 영화&year=abc&age=7&runtime=x&status=x&firstImport=1&sort=x&page=-1&q=%20%20',
    );
    expect(Object.values(invalid).every((value) => value === undefined)).toBe(true);
  });
  it('DB 정수 범위를 넘는 연도와 페이지는 버린다', () => {
    const huge = parse('year=99999999999&page=99999999999');
    expect(huge.year).toBeUndefined();
    expect(huge.page).toBeUndefined();
    expect(parse('year=10000').year).toBeUndefined();
    expect(parse('year=2026&page=100000')).toMatchObject({ year: 2026, page: 100000 });
    expect(parse('page=100001').page).toBeUndefined();
  });
  it('긴 검색어는 자른다', () => {
    expect(parse(`q=${'가'.repeat(200)}`).q).toHaveLength(100);
  });
});

it('toMovieQuery는 값이 있는 조건만 담는다', () => {
  expect(toMovieQuery({ genre: 'SF', q: '', firstImport: false, page: 2 })).toBe('genre=SF&page=2');
});
