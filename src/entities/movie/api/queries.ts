import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/request';
import type { MovieFilters } from '../model/filters';
import { getFacets, getHome, getMovie, getPlayback, searchMovies } from './movieApi';

export const useHome = () => useQuery({ queryKey: ['home'], queryFn: getHome });

export const useMovies = (filters: MovieFilters) =>
  useQuery({ queryKey: ['movies', filters], queryFn: () => searchMovies(filters) });

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
