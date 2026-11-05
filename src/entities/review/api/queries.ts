import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteReview, getReview, listReviews, saveReview } from './reviewStorage';

const KEY = 'reviews';
const CHANNEL = 'about-movie-reviews';

function notifyOtherTabs() {
  if (typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage('changed');
  channel.close();
}

/** 다른 탭에서 리뷰를 바꾸면 이 탭의 화면도 갱신합니다. */
export function useSyncReviewsAcrossTabs() {
  const client = useQueryClient();
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = () => client.invalidateQueries({ queryKey: [KEY] });
    return () => channel.close();
  }, [client]);
}

export const useReviews = () => useQuery({ queryKey: [KEY], queryFn: listReviews });

export const useReview = (id: string) => useQuery({ queryKey: [KEY, id], queryFn: () => getReview(id) });

export function useSaveReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: saveReview,
    onSuccess: () => {
      notifyOtherTabs();
      return client.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useDeleteReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      notifyOtherTabs();
      return client.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
