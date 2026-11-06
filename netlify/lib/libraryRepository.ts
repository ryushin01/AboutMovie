import { COMPLETED_RATIO, type MemberLibrary } from '../../src/entities/movie/model/types';
import type { Queryable } from './db';
import { findMoviesByIds } from './movieRepository';

export async function getProgress(db: Queryable, userId: string, movieId: string): Promise<number> {
  const { rows } = await db.query(
    'SELECT position_seconds FROM watch_progress WHERE user_id = $1 AND movie_id = $2',
    [userId, movieId],
  );
  return (rows[0] as { position_seconds: number } | undefined)?.position_seconds ?? 0;
}

/**
 * 보던 위치를 저장합니다. 거의 끝까지 봤으면 이어 보기에서 뺍니다.
 * 러닝타임을 넘는 값은 저장하지 않습니다. 없는 작품이면 false를 돌려줍니다.
 */
export async function saveProgress(
  db: Queryable,
  userId: string,
  movieId: string,
  positionSeconds: number,
): Promise<boolean> {
  const { rows } = await db.query('SELECT runtime_minutes FROM movies WHERE id = $1', [movieId]);
  const movie = rows[0] as { runtime_minutes: number } | undefined;
  if (!movie) return false;

  const duration = movie.runtime_minutes * 60;
  if (positionSeconds >= duration * COMPLETED_RATIO) {
    await db.query('DELETE FROM watch_progress WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
    return true;
  }
  await db.query(
    `INSERT INTO watch_progress (user_id, movie_id, position_seconds) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, movie_id) DO UPDATE SET position_seconds = EXCLUDED.position_seconds, updated_at = now()`,
    [userId, movieId, positionSeconds],
  );
  return true;
}

/** 찜합니다. 이미 찜했어도 성공으로 봅니다. 없는 작품이면 false를 돌려줍니다. */
export async function addToWatchlist(db: Queryable, userId: string, movieId: string): Promise<boolean> {
  const { rows } = await db.query('SELECT 1 FROM movies WHERE id = $1', [movieId]);
  if (rows.length === 0) return false;
  await db.query(
    'INSERT INTO watchlist (user_id, movie_id) VALUES ($1, $2) ON CONFLICT (user_id, movie_id) DO NOTHING',
    [userId, movieId],
  );
  return true;
}

export async function removeFromWatchlist(db: Queryable, userId: string, movieId: string): Promise<void> {
  await db.query('DELETE FROM watchlist WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
}

/** 회원과 작품의 조합이 기본 키라 작품 수를 넘지 않으므로 상한을 두지 않습니다. 디테일의 찜 상태도 이 목록으로 판단합니다. */
export async function getLibrary(db: Queryable, userId: string): Promise<MemberLibrary> {
  const { rows: saved } = await db.query(
    'SELECT movie_id FROM watchlist WHERE user_id = $1 ORDER BY created_at DESC, movie_id',
    [userId],
  );
  const { rows: progress } = await db.query(
    `SELECT movie_id, position_seconds FROM watch_progress
     WHERE user_id = $1 ORDER BY updated_at DESC, movie_id`,
    [userId],
  );
  const savedIds = (saved as { movie_id: string }[]).map((row) => row.movie_id);
  const watching = progress as { movie_id: string; position_seconds: number }[];
  const movies = await findMoviesByIds(db, [...savedIds, ...watching.map((row) => row.movie_id)]);
  return {
    watchlist: savedIds.flatMap((id) => movies.get(id) ?? []),
    continueWatching: watching.flatMap(({ movie_id, position_seconds }) => {
      const movie = movies.get(movie_id);
      return movie ? [{ movie, positionSeconds: position_seconds }] : [];
    }),
  };
}

/** 탈퇴한 회원의 기록을 모두 지웁니다. 한 문장으로 처리해 함께 성공하거나 실패합니다. */
export async function deleteMemberData(db: Queryable, userId: string): Promise<void> {
  await db.query(
    `WITH a AS (DELETE FROM watchlist WHERE user_id = $1),
          b AS (DELETE FROM watch_progress WHERE user_id = $1),
          c AS (DELETE FROM subscriptions WHERE user_id = $1)
     DELETE FROM payments WHERE user_id = $1`,
    [userId],
  );
}
