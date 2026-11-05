import type { RichDoc } from './richText';

/** TMDB의 공식 영화 장르 19개를 같은 순서로 옮겼습니다. (https://developer.themoviedb.org/reference/genre-movie-list) */
export const GENRES = [
  '액션',
  '모험',
  '애니메이션',
  '코미디',
  '범죄',
  '다큐멘터리',
  '드라마',
  '가족',
  '판타지',
  '역사',
  '공포',
  '음악',
  '미스터리',
  '로맨스',
  'SF',
  'TV 영화',
  '스릴러',
  '전쟁',
  '서부',
] as const;
export type Genre = (typeof GENRES)[number];

export interface Review {
  id: string;
  title: string;
  year: number;
  /** 1~5 */
  rating: number;
  /** 한 개 이상. API로 저장할 때 GENRES 순서로 맞춥니다. */
  genres: Genre[];
  /** 이미지 주소 (`/api/images/...` 또는 `/seed/...`) */
  poster: string;
  body: RichDoc;
  createdAt: string;
  updatedAt: string;
}

export type ReviewInput = Omit<Review, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };
