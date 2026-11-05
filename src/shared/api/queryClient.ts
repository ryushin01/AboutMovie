import { QueryClient } from '@tanstack/react-query';

// 저장소가 브라우저 안에 있으므로 네트워크 상태와 무관하게 동작합니다.
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { networkMode: 'always', retry: false, refetchOnWindowFocus: false },
      mutations: { networkMode: 'always' },
    },
  });
