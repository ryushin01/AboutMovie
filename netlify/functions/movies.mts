import { getDatabase } from '@netlify/database';
import type { Config, Context } from '@netlify/functions';
import { parseMovieFilters } from '../../src/entities/movie/model/filters';
import { findMovie, searchMovies } from '../lib/movieRepository';

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  const db = getDatabase().pool;
  const { id } = context.params;

  if (!id) {
    const filters = parseMovieFilters(new URL(req.url).searchParams);
    return Response.json(await searchMovies(db, filters, new Date()));
  }
  const movie = await findMovie(db, id);
  return movie ? Response.json(movie) : Response.json({ error: 'not_found' }, { status: 404 });
};

export const config: Config = { path: ['/api/movies', '/api/movies/:id'] };
