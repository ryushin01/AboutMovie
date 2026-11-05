import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteReview, getReview, listReviews, saveReview } from './reviewApi';

const KEY = 'reviews';

export const useReviews = () => useQuery({ queryKey: [KEY], queryFn: listReviews });

export const useReview = (id: string) => useQuery({ queryKey: [KEY, id], queryFn: () => getReview(id) });

export function useSaveReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: saveReview,
    onSuccess: () => client.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: (_result, id) => {
      // 지운 글을 다시 받지 않도록 상세 캐시는 없애고 목록만 새로 받습니다.
      client.removeQueries({ queryKey: [KEY, id] });
      return client.invalidateQueries({ queryKey: [KEY], exact: true });
    },
  });
}
