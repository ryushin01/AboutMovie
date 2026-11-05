import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteReview, getReview, listReviews, saveReview } from './reviewStorage';

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
    onSuccess: () => client.invalidateQueries({ queryKey: [KEY] }),
  });
}
