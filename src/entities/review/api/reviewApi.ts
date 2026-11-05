import { ApiError, request } from '@/shared/api/request';
import type { Review, ReviewInput } from '../model/types';

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const listReviews = () => request<Review[]>('/api/reviews');

export async function getReview(id: string): Promise<Review | null> {
  try {
    return await request<Review>(`/api/reviews/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function saveReview({ id, ...input }: ReviewInput): Promise<Review> {
  return id
    ? request<Review>(`/api/reviews/${encodeURIComponent(id)}`, json('PUT', input))
    : request<Review>('/api/reviews', json('POST', input));
}

export const deleteReview = (id: string) =>
  request<void>(`/api/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' });

const UPLOAD_ERRORS: Record<number, string> = {
  401: '로그인이 끝났습니다. 다시 로그인한 뒤 올려 주세요.',
  413: '이미지가 너무 큽니다. 더 작은 이미지를 올려 주세요.',
  415: 'JPG, PNG, WebP, GIF 이미지만 올릴 수 있습니다.',
};

/**
 * readImageFile이 만든 data URL을 올리고 공개 주소를 돌려받습니다.
 * 함수 플랫폼과 로컬 에뮬레이터가 바이너리 본문을 다르게 다루므로 base64 JSON으로 보냅니다.
 */
export async function uploadImage(dataUrl: string): Promise<string> {
  try {
    const { url } = await request<{ url: string }>(
      '/api/images',
      json('POST', { data: dataUrl.split(',')[1] }),
    );
    return url;
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 0;
    throw new Error(UPLOAD_ERRORS[status] ?? '이미지를 올리지 못했습니다. 잠시 뒤 다시 시도해 주세요.', {
      cause: error,
    });
  }
}
