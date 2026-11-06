import { PAGE_SIZE, type MovieFilters } from '../../src/entities/movie/model/filters';
import {
  koreaToday,
  type HomeData,
  type HomeRow,
  type Movie,
  type MovieFacets,
  type MoviePage,
} from '../../src/entities/movie/model/types';
import type { Queryable } from './db';

interface Row {
  id: string;
  title: string;
  original_title: string;
  year: number;
  country: string;
  language: string;
  genres: Movie['genres'];
  director: string;
  writer: string;
  cast_members: string[];
  runtime_minutes: number;
  age_rating: Movie['ageRating'];
  advisories: string[];
  moods: string[];
  audio_languages: string[];
  subtitle_languages: string[];
  synopsis: string;
  import_note: string;
  first_import: boolean;
  released_on_text: string;
  poster: string;
  backdrop: string;
}

const toMovie = (row: Row): Movie => ({
  id: row.id,
  title: row.title,
  originalTitle: row.original_title,
  year: row.year,
  country: row.country,
  language: row.language,
  genres: row.genres,
  director: row.director,
  writer: row.writer,
  cast: row.cast_members,
  runtimeMinutes: row.runtime_minutes,
  ageRating: row.age_rating,
  advisories: row.advisories,
  moods: row.moods,
  audioLanguages: row.audio_languages,
  subtitleLanguages: row.subtitle_languages,
  synopsis: row.synopsis,
  importNote: row.import_note,
  firstImport: row.first_import,
  releasedOn: row.released_on_text,
  poster: row.poster,
  backdrop: row.backdrop,
});

// DATE를 Date로 받으면 서버 시간대에 따라 하루가 밀리므로 문자열로 받습니다.
const COLUMNS = `*, released_on::text AS released_on_text`;

/** 검색어의 %와 _가 와일드카드로 해석되지 않게 합니다. */
const like = (text: string) => `%${text.replace(/[\\%_]/g, '\\$&')}%`;

function buildWhere(filters: MovieFilters, today: string) {
  const values: unknown[] = [];
  const bind = (value: unknown) => `$${values.push(value)}`;
  const where: string[] = [];

  if (filters.q) {
    const term = bind(like(filters.q));
    where.push(`(title ILIKE ${term} OR original_title ILIKE ${term} OR director ILIKE ${term}
      OR writer ILIKE ${term} OR country ILIKE ${term}
      OR EXISTS (SELECT 1 FROM unnest(cast_members) AS actor WHERE actor ILIKE ${term}))`);
  }
  if (filters.genre) where.push(`${bind(filters.genre)} = ANY(genres)`);
  if (filters.year) where.push(`year = ${bind(filters.year)}`);
  if (filters.country) where.push(`country = ${bind(filters.country)}`);
  if (filters.director) where.push(`director ILIKE ${bind(like(filters.director))}`);
  if (filters.actor)
    where.push(
      `EXISTS (SELECT 1 FROM unnest(cast_members) AS actor WHERE actor ILIKE ${bind(like(filters.actor))})`,
    );
  if (filters.age) where.push(`age_rating = ${bind(filters.age)}`);
  if (filters.runtime === 'short') where.push('runtime_minutes <= 90');
  if (filters.runtime === 'medium') where.push('runtime_minutes BETWEEN 91 AND 120');
  if (filters.runtime === 'long') where.push('runtime_minutes >= 121');
  if (filters.status === 'now') where.push(`released_on <= ${bind(today)}::date`);
  if (filters.status === 'upcoming') where.push(`released_on > ${bind(today)}::date`);
  if (filters.firstImport) where.push('first_import');

  return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', values, bind };
}

function orderBy({ sort, status }: MovieFilters, bind: (value: unknown) => string, today: string) {
  if (sort === 'title') return 'title COLLATE "C", id';
  if (sort === 'year') return 'year DESC, released_on DESC, id';
  if (sort === 'runtime') return 'runtime_minutes, id';
  // 공개 예정작만 볼 때는 가장 가까운 공개일부터, 그 밖에는 공개된 작품을 먼저 보여 줍니다.
  if (status === 'upcoming') return 'released_on, id';
  return `released_on > ${bind(today)}::date, released_on DESC, id`;
}

export async function searchMovies(
  db: Queryable,
  filters: MovieFilters,
  now: Date,
  pageSize = PAGE_SIZE,
): Promise<MoviePage> {
  const today = koreaToday(now);
  const page = filters.page ?? 1;
  const { clause, values, bind } = buildWhere(filters, today);
  const { rows: counted } = await db.query(`SELECT count(*)::int AS total FROM movies ${clause}`, values);
  const order = orderBy(filters, bind, today);
  const limit = bind(pageSize);
  const offset = bind((page - 1) * pageSize);
  const { rows } = await db.query(
    `SELECT ${COLUMNS} FROM movies ${clause} ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}`,
    values,
  );
  return {
    items: (rows as Row[]).map(toMovie),
    total: (counted[0] as { total: number }).total,
    page,
    pageSize,
  };
}

export async function findMovie(db: Queryable, id: string): Promise<Movie | null> {
  const { rows } = await db.query(`SELECT ${COLUMNS} FROM movies WHERE id = $1`, [id]);
  return rows[0] ? toMovie(rows[0] as Row) : null;
}

export async function movieFacets(db: Queryable): Promise<MovieFacets> {
  const { rows } = await db.query(`
    SELECT
      (SELECT array_agg(DISTINCT year ORDER BY year DESC) FROM movies) AS years,
      (SELECT array_agg(DISTINCT country ORDER BY country) FROM movies) AS countries,
      (SELECT array_agg(DISTINCT director ORDER BY director) FROM movies) AS directors,
      (SELECT array_agg(DISTINCT actor ORDER BY actor) FROM movies, unnest(cast_members) AS actor) AS actors,
      (SELECT array_agg(DISTINCT age_rating) FROM movies) AS age_ratings
  `);
  const row = rows[0] as Record<string, unknown[] | null>;
  return {
    years: (row.years ?? []) as number[],
    countries: (row.countries ?? []) as string[],
    directors: (row.directors ?? []) as string[],
    actors: (row.actors ?? []) as string[],
    ageRatings: (['all', '12', '15', '19'] as const).filter((age) => row.age_ratings?.includes(age)),
  };
}

const HOME_ROW_SIZE = 16;
const HOME_GENRES = ['드라마', '스릴러', 'SF', '가족'] as const;

/** 메인 화면: 차별점인 국내 첫 공개작을 맨 앞에 두고, 공개 예정과 장르별 줄을 잇습니다. */
export async function homeData(db: Queryable, now: Date): Promise<HomeData> {
  const definitions: { title: string; query: string; filters: MovieFilters }[] = [
    {
      title: '국내 첫 공개',
      query: 'firstImport=true&status=now',
      filters: { firstImport: true, status: 'now' },
    },
    { title: '공개 예정', query: 'status=upcoming', filters: { status: 'upcoming' } },
    { title: '최근 공개', query: 'status=now', filters: { status: 'now' } },
    ...HOME_GENRES.map((genre) => ({
      title: genre,
      query: new URLSearchParams({ genre, status: 'now' }).toString(),
      filters: { genre, status: 'now' } as MovieFilters,
    })),
  ];
  const pages = await Promise.all(
    definitions.map(({ filters }) => searchMovies(db, filters, now, HOME_ROW_SIZE)),
  );
  const rows: HomeRow[] = definitions
    .map(({ title, query }, index) => ({ title, query, movies: pages[index].items }))
    .filter((row) => row.movies.length > 0);
  return { featured: pages[0].items[0] ?? pages[2].items[0] ?? null, rows };
}
