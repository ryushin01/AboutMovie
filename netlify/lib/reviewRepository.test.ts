// @vitest-environment node
import { NetlifyDB } from '@netlify/database-dev';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { isValidRichDoc, type RichDoc } from '../../src/entities/review/model/richText';
import { GENRES } from '../../src/entities/review/model/types';
import { createReview, deleteReview, findReview, listReviews, updateReview } from './reviewRepository';

const body: RichDoc = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: '본문' }] }],
};
const fields = {
  title: '테스트 영화',
  year: 2025,
  rating: 4,
  genres: ['드라마', 'SF'] as ('드라마' | 'SF')[],
  poster: '/api/images/a.jpg',
  body,
};

// 실제 Postgres에 마이그레이션을 적용해 시드와 쿼리를 함께 검사합니다.
describe('reviewRepository', () => {
  let database: NetlifyDB;
  let client: Client;

  beforeAll(async () => {
    database = new NetlifyDB();
    const connectionString = await database.start();
    await database.applyMigrations('./netlify/database/migrations');
    client = new Client({ connectionString });
    await client.connect();
  });
  afterAll(async () => {
    await client.end();
    await database.stop();
  });

  it('시드는 최신순으로 나오고 본문은 JSON으로 돌아온다', async () => {
    const reviews = await listReviews(client);
    expect(reviews).toHaveLength(36);
    expect(reviews[0].id).toBe('sample-last-screening');
    expect(reviews[0].body.type).toBe('doc');
    expect(reviews[0].createdAt).toBe('2026-10-28T09:00:00.000Z');
    expect(reviews[0].genres).toEqual(['드라마']);
  });

  it('시드는 TMDB의 모든 장르를 쓰고 글과 이미지가 번갈아 나온다', async () => {
    const reviews = await listReviews(client);
    expect(new Set(reviews.flatMap((review) => review.genres))).toEqual(new Set(GENRES));
    for (const review of reviews) {
      const types = review.body.content?.map((node) => node.type) ?? [];
      expect(types.slice(0, 4), review.id).toEqual(['paragraph', 'image', 'paragraph', 'image']);
      expect(isValidRichDoc(review.body), review.id).toBe(true);
    }
  });

  it('만들고 고치고 지운다', async () => {
    const created = await createReview(client, 'r1', fields);
    expect(created.title).toBe('테스트 영화');
    expect((await findReview(client, 'r1'))?.body).toEqual(body);

    const updated = await updateReview(client, 'r1', { ...fields, title: '고친 제목' });
    expect(updated?.title).toBe('고친 제목');
    expect(updated?.createdAt).toBe(created.createdAt);

    expect((await deleteReview(client, 'r1'))?.id).toBe('r1');
    expect(await findReview(client, 'r1')).toBeNull();
  });

  it('없는 글을 고치거나 지우면 null을 돌려준다', async () => {
    expect(await updateReview(client, 'none', fields)).toBeNull();
    expect(await deleteReview(client, 'none')).toBeNull();
  });

  it('값은 쿼리에 바인딩되어 SQL로 실행되지 않는다', async () => {
    const before = (await listReviews(client)).length;
    expect(await findReview(client, "x' OR '1'='1")).toBeNull();
    expect((await listReviews(client)).length).toBe(before);
  });
});
