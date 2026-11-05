import type { Review, ReviewInput, Scene } from '@/entities/review';

export interface Draft {
  title: string;
  year: string;
  rating: string;
  poster: string;
  body: string;
  scenes: Scene[];
}

export interface DraftErrors {
  title?: string;
  year?: string;
  rating?: string;
  poster?: string;
  body?: string;
  sceneFile?: string;
  /** 장면 id별 설명 오류 */
  scenes?: Record<string, string>;
}

const MIN_YEAR = 1888; // 현존하는 가장 오래된 영화가 나온 해

export const toDraft = (review?: Review): Draft => ({
  title: review?.title ?? '',
  year: review ? String(review.year) : '',
  rating: review ? String(review.rating) : '',
  poster: review?.poster ?? '',
  body: review?.body ?? '',
  scenes: review?.scenes ?? [],
});

export const isDraftChanged = (before: Draft, after: Draft) =>
  before.title !== after.title ||
  before.year !== after.year ||
  before.rating !== after.rating ||
  before.poster !== after.poster ||
  before.body !== after.body ||
  before.scenes.length !== after.scenes.length ||
  before.scenes.some((scene, index) => {
    const other = after.scenes[index];
    return scene.id !== other.id || scene.description !== other.description;
  });

export function validateDraft(draft: Draft): DraftErrors {
  const errors: DraftErrors = {};
  const maxYear = new Date().getFullYear() + 5;
  const year = Number(draft.year);

  if (!draft.title.trim()) errors.title = '영화 제목을 입력해 주세요.';
  if (!Number.isInteger(year) || year < MIN_YEAR || year > maxYear) {
    errors.year = `개봉 연도를 ${MIN_YEAR}~${maxYear} 사이의 숫자로 입력해 주세요.`;
  }
  if (!draft.rating) errors.rating = '평점을 선택해 주세요.';
  if (!draft.poster) errors.poster = '포스터 이미지를 올려 주세요.';
  if (!draft.body.trim()) errors.body = '리뷰 내용을 입력해 주세요.';

  const scenes = Object.fromEntries(
    draft.scenes
      .filter((scene) => !scene.description.trim())
      .map((scene) => [scene.id, '장면 설명을 입력해 주세요.']),
  );
  if (Object.keys(scenes).length > 0) errors.scenes = scenes;

  return errors;
}

export const toReviewInput = (draft: Draft, id?: string): ReviewInput => ({
  id,
  title: draft.title.trim(),
  year: Number(draft.year),
  rating: Number(draft.rating),
  poster: draft.poster,
  body: draft.body.trim(),
  scenes: draft.scenes.map((scene) => ({ ...scene, description: scene.description.trim() })),
});
