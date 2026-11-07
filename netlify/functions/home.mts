import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { publicCatalogCache } from '../lib/cache';
import { homeData } from '../lib/movieRepository';

export default async () =>
  Response.json(await homeData(getDatabase().pool, new Date()), { headers: publicCatalogCache });

export const config: Config = { path: '/api/home' };
