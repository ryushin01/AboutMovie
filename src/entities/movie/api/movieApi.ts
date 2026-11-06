import { ApiError, request } from '@/shared/api/request';
import { toMovieQuery, type MovieFilters } from '../model/filters';
import type { HomeData, MemberLibrary, Movie, MovieFacets, MoviePage } from '../model/types';

export const getHome = () => request<HomeData>('/api/home');

export function searchMovies(filters: MovieFilters) {
  const query = toMovieQuery(filters);
  return request<MoviePage>(query ? `/api/movies?${query}` : '/api/movies');
}

export const getFacets = () => request<MovieFacets>('/api/movie-facets');

export async function getMovie(id: string): Promise<Movie | null> {
  try {
    return await request<Movie>(`/api/movies/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** 재생 권한을 확인합니다. 실패하면 상태 코드로 이유를 구분합니다. */
export const getPlayback = (id: string) =>
  request<{ quality: string; positionSeconds: number }>(`/api/movies/${encodeURIComponent(id)}/playback`);

export const getLibrary = () => request<MemberLibrary>('/api/library');

export const setWatchlisted = (id: string, saved: boolean) =>
  request<void>(`/api/library/watchlist/${encodeURIComponent(id)}`, { method: saved ? 'PUT' : 'DELETE' });

export const saveProgress = (id: string, positionSeconds: number) =>
  request<void>(`/api/library/progress/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ positionSeconds }),
  });
