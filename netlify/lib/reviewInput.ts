import { GENRES, type Genre } from '../../src/entities/review/model/types';
import {
  isEmptyDoc,
  isSafeImagePath,
  isValidRichDoc,
  type RichDoc,
} from '../../src/entities/review/model/richText';

export interface ReviewFields {
  title: string;
  year: number;
  rating: number;
  genre: Genre;
  poster: string;
  body: RichDoc;
}

const MIN_YEAR = 1888; // 현존하는 가장 오래된 영화가 나온 해

/** 브라우저 검증과 별개로 서버에서 다시 확인합니다. 통과하지 못하면 잘못된 항목 이름을 돌려줍니다. */
export function parseReviewFields(input: unknown): { fields: ReviewFields } | { invalid: string[] } {
  const value = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const { year, rating, genre, poster, body } = value;
  const maxYear = new Date().getFullYear() + 5;

  const invalid: string[] = [];
  if (!title || title.length > 100) invalid.push('title');
  if (!Number.isInteger(year) || (year as number) < MIN_YEAR || (year as number) > maxYear)
    invalid.push('year');
  if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) invalid.push('rating');
  if (!GENRES.includes(genre as Genre)) invalid.push('genre');
  if (!isSafeImagePath(poster)) invalid.push('poster');
  if (!isValidRichDoc(body) || isEmptyDoc(body)) invalid.push('body');
  if (invalid.length > 0) return { invalid };

  return {
    fields: {
      title,
      year: year as number,
      rating: rating as number,
      genre: genre as Genre,
      poster: poster as string,
      body: body as RichDoc,
    },
  };
}
