import { expect, it } from 'vitest';
import { routes, safeNext } from './routes';

it('safeNext는 사이트 안의 경로만 받는다', () => {
  expect(safeNext('/movies/a')).toBe('/movies/a');
  expect(safeNext(null)).toBe('/');
  expect(safeNext('https://evil.example')).toBe('/');
  expect(safeNext('//evil.example')).toBe('/');
  expect(safeNext('/\\evil.example')).toBe('/');
});

it('movies는 조건을 주소에 담는다', () => {
  expect(routes.movies()).toBe('/movies');
  expect(routes.movies({ genre: 'SF' })).toBe('/movies?genre=SF');
});
