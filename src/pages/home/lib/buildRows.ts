import { GENRES, type Review } from '@/entities/review';

export interface Row {
  title: string;
  reviews: Review[];
}

const ROW_LIMIT = 12;
const RECOMMEND_MIN_RATING = 4;

/** 최신, 추천, 장르 순서로 줄을 만듭니다. 비어 있는 줄은 넣지 않습니다. reviews는 최신순입니다. */
export function buildRows(reviews: Review[]): Row[] {
  const recommended = reviews
    .filter((review) => review.rating >= RECOMMEND_MIN_RATING)
    .sort((a, b) => b.rating - a.rating);
  return [
    { title: '최신 리뷰', reviews: reviews.slice(0, ROW_LIMIT) },
    { title: '평론가 추천', reviews: recommended.slice(0, ROW_LIMIT) },
    ...GENRES.map((genre) => ({
      title: genre as string,
      reviews: reviews.filter((review) => review.genres.includes(genre)),
    })),
  ].filter((row) => row.reviews.length > 0);
}
