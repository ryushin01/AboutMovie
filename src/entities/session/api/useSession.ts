import { useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '@/shared/api/request';

const KEY = ['session'];

/** 쓰기 메뉴를 보여 줄지 정합니다. 실패하면 읽기 전용으로 둡니다. 실제 권한은 서버가 요청마다 확인합니다. */
export function useSession() {
  const { data, isPending } = useQuery({
    queryKey: KEY,
    queryFn: () => request<{ isCritic: boolean }>('/api/me').catch(() => ({ isCritic: false })),
    staleTime: 5 * 60 * 1000,
  });
  return { isCritic: data?.isCritic ?? false, isPending };
}

export function useRefreshSession() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: KEY });
}
