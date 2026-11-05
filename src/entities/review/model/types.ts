import type { RichDoc } from './richText';

export const GENRES = [
  '드라마',
  '스릴러',
  'SF',
  '로맨스',
  '코미디',
  '액션',
  '다큐멘터리',
  '애니메이션',
] as const;
export type Genre = (typeof GENRES)[number];

export interface Review {
  id: string;
  title: string;
  year: number;
  /** 1~5 */
  rating: number;
  genre: Genre;
  /** 이미지 주소 (`/api/images/...` 또는 `/seed/...`) */
  poster: string;
  body: RichDoc;
  createdAt: string;
  updatedAt: string;
}

export type ReviewInput = Omit<Review, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };
