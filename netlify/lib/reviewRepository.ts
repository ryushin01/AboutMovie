import type { Review } from '../../src/entities/review/model/types';
import type { ReviewFields } from './reviewInput';

/** pg의 Pool과 Client가 모두 맞는 최소 형태입니다. 테스트에서 실제 Postgres에 연결합니다. */
export interface Queryable {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
}

interface Row {
  id: string;
  title: string;
  year: number;
  rating: number;
  genres: Review['genres'];
  poster: string;
  body: Review['body'];
  created_at: Date;
  updated_at: Date;
}

const toReview = (row: Row): Review => ({
  id: row.id,
  title: row.title,
  year: row.year,
  rating: row.rating,
  genres: row.genres,
  poster: row.poster,
  body: row.body,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

export async function listReviews(db: Queryable): Promise<Review[]> {
  const { rows } = await db.query('SELECT * FROM reviews ORDER BY created_at DESC, id');
  return (rows as Row[]).map(toReview);
}

export async function findReview(db: Queryable, id: string): Promise<Review | null> {
  const { rows } = await db.query('SELECT * FROM reviews WHERE id = $1', [id]);
  return rows[0] ? toReview(rows[0] as Row) : null;
}

export async function createReview(db: Queryable, id: string, fields: ReviewFields): Promise<Review> {
  const { rows } = await db.query(
    `INSERT INTO reviews (id, title, year, rating, genres, poster, body)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [id, fields.title, fields.year, fields.rating, fields.genres, fields.poster, JSON.stringify(fields.body)],
  );
  return toReview(rows[0] as Row);
}

export async function updateReview(db: Queryable, id: string, fields: ReviewFields): Promise<Review | null> {
  const { rows } = await db.query(
    `UPDATE reviews
     SET title = $2, year = $3, rating = $4, genres = $5, poster = $6, body = $7, updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id, fields.title, fields.year, fields.rating, fields.genres, fields.poster, JSON.stringify(fields.body)],
  );
  return rows[0] ? toReview(rows[0] as Row) : null;
}

export async function deleteReview(db: Queryable, id: string): Promise<Review | null> {
  const { rows } = await db.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [id]);
  return rows[0] ? toReview(rows[0] as Row) : null;
}
