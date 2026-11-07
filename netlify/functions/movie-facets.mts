import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { publicCatalogCache } from '../lib/cache';
import { movieFacets } from '../lib/movieRepository';

/** 필터에 보여 줄 연도, 국가, 감독, 배우 목록입니다. */
export default async () =>
  Response.json(await movieFacets(getDatabase().pool), { headers: publicCatalogCache });

export const config: Config = { path: '/api/movie-facets' };
