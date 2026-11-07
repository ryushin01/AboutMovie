import { expect, it } from 'vitest';
import { nextSearch, paths, routes, safeNext } from './routes';

it('safeNext는 사이트 안의 경로만 받는다', () => {
  expect(safeNext('/movies/a')).toBe('/movies/a');
  expect(safeNext(null)).toBe('/');
  expect(safeNext('https://evil.example')).toBe('/');
  expect(safeNext('//evil.example')).toBe('/');
  expect(safeNext('/\\evil.example')).toBe('/');
});

it('routes는 라우터에 넘길 경로와 조건을, paths는 돌아올 주소 문자열을 만든다', () => {
  expect(routes.movies({ genre: 'SF' })).toEqual({ to: '/movies', search: { genre: 'SF' } });
  expect(routes.login(paths.watch('a b'))).toEqual({ to: '/login', search: { next: '/watch/a%20b' } });
  expect(paths.login('/plans')).toBe('/login?next=%2Fplans');
});

it('nextSearch는 문자열 next만 받는다', () => {
  expect(nextSearch({ next: '/plans' })).toEqual({ next: '/plans' });
  expect(nextSearch({ next: 3 })).toEqual({});
});
