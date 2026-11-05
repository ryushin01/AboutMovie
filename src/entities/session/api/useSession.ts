import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, request } from '@/shared/api/request';

const KEY = ['session'];

/**
 * 쓰기 메뉴를 보여 줄지 정합니다. 실패하면 읽기 전용으로 둡니다. 실제 권한은 서버가 요청마다 확인합니다.
 * 함수가 깨어나는 중의 일시적인 실패는 다시 시도하도록, 4xx 응답만 권한 없음으로 저장합니다.
 */
export function useSession() {
  const { data, isPending } = useQuery({
    queryKey: KEY,
    queryFn: () =>
      request<{ isCritic: boolean }>('/api/me').catch((error: unknown) => {
        if (error instanceof ApiError && error.status < 500) return { isCritic: false };
        throw error;
      }),
    staleTime: 5 * 60 * 1000,
  });
  return { isCritic: data?.isCritic ?? false, isPending };
}

export function useRefreshSession() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: KEY });
}

/** 로그아웃이 끝난 뒤 쓰기 메뉴를 바로 닫습니다. 다시 조회하면 그 요청이 실패할 때 이전 권한이 남습니다. */
export function useClearSession() {
  const client = useQueryClient();
  return async () => {
    await client.cancelQueries({ queryKey: KEY });
    client.setQueryData(KEY, { isCritic: false });
  };
}
