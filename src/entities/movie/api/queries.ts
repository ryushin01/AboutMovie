import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/request';
import type { MovieFilters } from '../model/filters';
import {
  getFacets,
  getHome,
  getLibrary,
  getMovie,
  getPlayback,
  saveProgress,
  searchMovies,
  setWatchlisted,
} from './movieApi';

export const useHome = () => useQuery({ queryKey: ['home'], queryFn: getHome });

export const useMovies = (filters: MovieFilters) =>
  useQuery({
    queryKey: ['movies', filters],
    queryFn: () => searchMovies(filters),
    // 조건을 바꾸는 동안 결과가 비어 화면이 튀지 않게 이전 결과를 둡니다.
    placeholderData: keepPreviousData,
  });

export const useMovie = (id: string) => useQuery({ queryKey: ['movie', id], queryFn: () => getMovie(id) });

export const useMovieFacets = () =>
  useQuery({ queryKey: ['movie-facets'], queryFn: getFacets, staleTime: 5 * 60 * 1000 });

/** 권한은 이용권이 바뀌면 달라지므로 저장해 두지 않습니다. 권한 없음은 다시 시도하지 않습니다. */
export const usePlayback = (id: string) =>
  useQuery({
    queryKey: ['playback', id],
    queryFn: () => getPlayback(id),
    gcTime: 0,
    retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 1,
  });

const LIBRARY = 'library';

/** 회원마다 따로 저장해, 로그아웃 뒤 다른 회원에게 이전 목록이 보이지 않게 합니다. */
export const useLibrary = (userId: string | undefined) =>
  useQuery({ queryKey: [LIBRARY, userId], queryFn: getLibrary, enabled: Boolean(userId) });

export function useToggleWatchlist() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) => setWatchlisted(id, saved),
    onSuccess: () => client.invalidateQueries({ queryKey: [LIBRARY] }),
  });
}

export function useSaveProgress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, positionSeconds }: { id: string; positionSeconds: number }) =>
      saveProgress(id, positionSeconds),
    onSuccess: () => client.invalidateQueries({ queryKey: [LIBRARY] }),
  });
}
