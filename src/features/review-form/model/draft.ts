import { emptyDoc, isEmptyDoc, type Review, type ReviewInput, type RichDoc } from '@/entities/review';

export interface Draft {
  title: string;
  year: string;
  rating: string;
  genre: string;
  poster: string;
  body: RichDoc;
}

export interface DraftErrors {
  title?: string;
  year?: string;
  rating?: string;
  genre?: string;
  poster?: string;
  body?: string;
}

const MIN_YEAR = 1888; // 현존하는 가장 오래된 영화가 나온 해

export const toDraft = (review?: Review): Draft => ({
  title: review?.title ?? '',
  year: review ? String(review.year) : '',
  rating: review ? String(review.rating) : '',
  genre: review?.genre ?? '',
  poster: review?.poster ?? '',
  body: review?.body ?? emptyDoc(),
});

export const isDraftChanged = (before: Draft, after: Draft) =>
  JSON.stringify(before) !== JSON.stringify(after);

export function validateDraft(draft: Draft): DraftErrors {
  const errors: DraftErrors = {};
  const maxYear = new Date().getFullYear() + 5;
  const year = Number(draft.year);

  if (!draft.title.trim()) errors.title = '영화 제목을 입력해 주세요.';
  if (!Number.isInteger(year) || year < MIN_YEAR || year > maxYear) {
    errors.year = `개봉 연도를 ${MIN_YEAR}~${maxYear} 사이의 숫자로 입력해 주세요.`;
  }
  if (!draft.rating) errors.rating = '평점을 선택해 주세요.';
  if (!draft.genre) errors.genre = '장르를 선택해 주세요.';
  if (!draft.poster) errors.poster = '포스터 이미지를 올려 주세요.';
  if (isEmptyDoc(draft.body)) errors.body = '리뷰 내용을 입력해 주세요.';

  return errors;
}

export const toReviewInput = (draft: Draft, id?: string): ReviewInput => ({
  id,
  title: draft.title.trim(),
  year: Number(draft.year),
  rating: Number(draft.rating),
  genre: draft.genre as ReviewInput['genre'],
  poster: draft.poster,
  body: draft.body,
});
