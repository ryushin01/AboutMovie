import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './request';

// 첫 요청은 함수와 DB가 깨어나는 동안 실패할 수 있어 한 번 더 시도합니다.
// 4xx는 다시 보내도 결과가 같으므로(로그인 필요, 이용권 필요 등) 바로 화면에 알립니다.
export const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < 1 && !(error instanceof ApiError && error.status < 500);

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry, retryDelay: 300, refetchOnWindowFocus: false },
    },
  });
