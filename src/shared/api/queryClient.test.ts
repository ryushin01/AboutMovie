import { describe, expect, it } from 'vitest';
import { shouldRetry } from './queryClient';
import { ApiError } from './request';

describe('shouldRetry', () => {
  it('서버 오류와 네트워크 오류는 한 번만 다시 시도한다', () => {
    expect(shouldRetry(0, new ApiError(503))).toBe(true);
    expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true);
    expect(shouldRetry(1, new ApiError(503))).toBe(false);
  });

  it('4xx는 다시 시도하지 않는다', () => {
    for (const status of [401, 403, 404, 409]) expect(shouldRetry(0, new ApiError(status))).toBe(false);
  });
});
