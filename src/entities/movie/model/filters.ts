import { AGE_RATINGS, GENRES, type AgeRating, type Genre } from './types';

export const SORTS = {
  latest: '최근 공개순',
  year: '제작 연도순',
  title: '제목순',
  runtime: '짧은 러닝타임순',
} as const;
export type Sort = keyof typeof SORTS;

export const RUNTIMES = { short: '90분 이하', medium: '91~120분', long: '121분 이상' } as const;
export type Runtime = keyof typeof RUNTIMES;

export const STATUSES = { now: '공개 중', upcoming: '공개 예정' } as const;
export type Status = keyof typeof STATUSES;

export const PAGE_SIZE = 24;
const MAX_TEXT = 100;
// 범위를 넘는 값이 DB 정수로 바뀌다 오류를 내지 않게 합니다.
const MAX_YEAR = 9999;
const MAX_PAGE = 100000;

export interface MovieFilters {
  q?: string;
  genre?: Genre;
  year?: number;
  country?: string;
  director?: string;
  actor?: string;
  age?: AgeRating;
  runtime?: Runtime;
  status?: Status;
  firstImport?: boolean;
  sort?: Sort;
  page?: number;
}

const text = (value: string | null) => value?.trim().slice(0, MAX_TEXT) || undefined;
const oneOf = <T extends string>(value: string | null, allowed: readonly T[]) =>
  allowed.includes(value as T) ? (value as T) : undefined;
const positive = (value: string | null, max: number) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 && number <= max ? number : undefined;
};

/** 주소의 검색 조건을 읽습니다. 화면과 서버가 함께 쓰며, 잘못된 값은 조건이 없는 것으로 봅니다. */
export function parseMovieFilters(params: URLSearchParams): MovieFilters {
  return {
    q: text(params.get('q')),
    genre: oneOf(params.get('genre'), GENRES),
    year: positive(params.get('year'), MAX_YEAR),
    country: text(params.get('country')),
    director: text(params.get('director')),
    actor: text(params.get('actor')),
    age: oneOf(params.get('age'), AGE_RATINGS),
    runtime: oneOf(params.get('runtime'), Object.keys(RUNTIMES) as Runtime[]),
    status: oneOf(params.get('status'), Object.keys(STATUSES) as Status[]),
    firstImport: params.get('firstImport') === 'true' || undefined,
    sort: oneOf(params.get('sort'), Object.keys(SORTS) as Sort[]),
    page: positive(params.get('page'), MAX_PAGE),
  };
}

/** 값이 있는 조건만 주소로 만듭니다. */
export function toMovieQuery(filters: MovieFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '' && value !== false) params.set(key, String(value));
  }
  return params.toString();
}
