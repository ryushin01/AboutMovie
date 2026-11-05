import { QueryClient } from '@tanstack/react-query';

// 첫 요청은 함수와 DB가 깨어나는 동안 실패할 수 있어 한 번 더 시도합니다.
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: 1, retryDelay: 300, refetchOnWindowFocus: false },
    },
  });
