// @vitest-environment node
import { NetlifyDB } from '@netlify/database-dev';
import { Client } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { GENRES } from '../../src/entities/movie/model/types';
import { findMovie, homeData, movieFacets, searchMovies } from './movieRepository';
import {
  cancelSubscription,
  changePlan,
  getSubscriptionData,
  resumeSubscription,
  subscribe,
} from './subscriptionRepository';

const NOW = new Date('2026-11-06T03:00:00.000Z');
const LATER = (months: number, days = 1) => {
  const date = new Date(NOW);
  date.setUTCMonth(date.getUTCMonth() + months);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

// 실제 Postgres에 마이그레이션을 적용해 시드와 쿼리를 함께 검사합니다.
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

const titles = async (filters: Parameters<typeof searchMovies>[1]) =>
  (await searchMovies(client, filters, NOW)).items.map((movie) => movie.title);

describe('영화 시드', () => {
  it('모든 장르를 쓰고 필수 정보를 갖췄다', async () => {
    const { items, total } = await searchMovies(client, {}, NOW, 100);
    expect(total).toBe(36);
    expect(new Set(items.flatMap((movie) => movie.genres))).toEqual(new Set(GENRES));
    for (const movie of items) {
      expect(movie.cast.length, movie.id).toBeGreaterThan(0);
      expect(movie.runtimeMinutes, movie.id).toBeGreaterThan(0);
      expect(movie.synopsis, movie.id).not.toBe('');
      expect(movie.releasedOn, movie.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('성인 인증이 없으므로 청소년 관람불가 작품은 넣지 않는다', async () => {
    expect((await movieFacets(client)).ageRatings).toEqual(['all', '12', '15']);
  });
});

describe('searchMovies', () => {
  it('제목, 원제, 감독, 배우로 검색한다', async () => {
    expect(await titles({ q: '항구' })).toEqual(['철의 항구']);
    expect(await titles({ q: 'talvitie' })).toEqual(['겨울의 항로']);
    expect(await titles({ q: '곤살로' })).toEqual(['철의 항구']);
    expect(await titles({ q: '루시아 알코바' })).toEqual(['네온 레인']);
  });

  it('검색어의 특수 문자를 글자 그대로 찾고 SQL로 실행하지 않는다', async () => {
    expect(await titles({ q: '%' })).toEqual([]);
    expect(await titles({ q: "x' OR '1'='1" })).toEqual([]);
  });

  it('여러 필터를 함께 적용한다', async () => {
    const { items } = await searchMovies(
      client,
      { genre: '범죄', year: 2026, country: '칠레', age: '15', runtime: 'medium' },
      NOW,
    );
    expect(items.map((movie) => movie.id)).toEqual(['iron-harbor']);
    expect(await titles({ director: '니노', actor: '타마르' })).toEqual(['소금을 만드는 사람들']);
  });

  it('러닝타임 구간을 나눈다', async () => {
    const short = (await searchMovies(client, { runtime: 'short' }, NOW, 100)).items;
    const long = (await searchMovies(client, { runtime: 'long' }, NOW, 100)).items;
    expect(short.every((movie) => movie.runtimeMinutes <= 90)).toBe(true);
    expect(long.every((movie) => movie.runtimeMinutes >= 121)).toBe(true);
  });

  it('공개 상태를 나누고, 공개 예정작은 가까운 날부터 보여 준다', async () => {
    const upcoming = (await searchMovies(client, { status: 'upcoming' }, NOW)).items;
    expect(upcoming.map((movie) => movie.releasedOn)).toEqual([
      '2027-01-15',
      '2027-02-05',
      '2027-03-12',
      '2027-04-02',
    ]);
    const now = (await searchMovies(client, { status: 'now' }, NOW)).items;
    expect(now[0].id).toBe('last-screening');
    expect(now.length).toBe(24);
  });

  it('기본 정렬은 공개된 작품을 공개 예정작보다 앞에 둔다', async () => {
    const { items } = await searchMovies(client, {}, NOW, 100);
    expect(items[0].id).toBe('last-screening');
    expect(items.slice(-4).every((movie) => movie.releasedOn > '2026-11-06')).toBe(true);
  });

  it('공개일은 한국 날짜로 판단한다', async () => {
    // 한국 시각 2027-01-15 00:30
    const atMidnight = new Date('2027-01-14T15:30:00.000Z');
    const { items } = await searchMovies(client, { status: 'now', q: '시계의 섬' }, atMidnight);
    expect(items).toHaveLength(1);
  });

  it('범위 밖의 페이지는 오류 없이 빈 목록을 돌려준다', async () => {
    const { items, total } = await searchMovies(client, { page: 100000 }, NOW);
    expect(items).toEqual([]);
    expect(total).toBe(36);
  });

  it('페이지를 나눈다', async () => {
    const first = await searchMovies(client, { page: 1 }, NOW);
    const second = await searchMovies(client, { page: 2 }, NOW);
    expect(first.total).toBe(36);
    expect(first.items).toHaveLength(24);
    expect(second.items).toHaveLength(12);
    expect(new Set([...first.items, ...second.items].map((movie) => movie.id)).size).toBe(36);
  });
});

it('findMovie는 전체 정보를 돌려주고, 없으면 null이다', async () => {
  const movie = await findMovie(client, 'paper-whale');
  expect(movie).toMatchObject({
    originalTitle: 'Pappersvalen',
    ageRating: 'all',
    runtimeMinutes: 88,
    audioLanguages: ['스웨덴어', '한국어'],
    firstImport: true,
    releasedOn: '2026-07-24',
  });
  expect(await findMovie(client, 'none')).toBeNull();
});

it('homeData는 국내 첫 공개작을 앞세운다', async () => {
  const { featured, rows } = await homeData(client, NOW);
  expect(featured?.firstImport).toBe(true);
  expect(rows[0].title).toBe('국내 첫 공개');
  expect(rows[0].movies.every((movie) => movie.firstImport && movie.releasedOn <= '2026-11-06')).toBe(true);
  expect(rows[1].title).toBe('공개 예정');
});

describe('이용권', () => {
  const USER = 'user-1';
  const data = (now = NOW) => getSubscriptionData(client, USER, now);

  beforeEach(async () => {
    await client.query('DELETE FROM subscriptions');
    await client.query('DELETE FROM payments');
  });

  it('구독을 시작하면 한 달 뒤까지 이용하고 결제가 기록된다', async () => {
    expect(await subscribe(client, USER, 'standard', NOW)).toBe('ok');
    const { subscription, payments } = await data();
    expect(subscription).toMatchObject({ plan: 'standard', status: 'active' });
    expect(subscription?.currentPeriodEnd).toBe('2026-12-06T03:00:00.000Z');
    expect(payments).toMatchObject([{ plan: 'standard', amount: 10900, kind: 'new', status: 'paid' }]);
  });

  it('중복 요청은 두 번 결제하지 않는다', async () => {
    const results = await Promise.all([
      subscribe(client, USER, 'basic', NOW),
      subscribe(client, USER, 'basic', NOW),
    ]);
    expect(results.filter((result) => result === 'ok')).toHaveLength(1);
    expect((await data()).payments).toHaveLength(1);
  });

  it('결제에 실패하면 구독은 시작되지 않고 실패가 기록된다', async () => {
    expect(await subscribe(client, USER, 'basic', NOW, { simulateFailure: true })).toBe('payment_failed');
    const { subscription, payments } = await data();
    expect(subscription).toBeNull();
    expect(payments).toMatchObject([{ status: 'failed' }]);
  });

  it('기간이 지나면 자동 갱신하고, 여러 달이 지나면 달마다 결제한다', async () => {
    await subscribe(client, USER, 'basic', NOW);
    const { subscription, payments } = await data(LATER(3));
    expect(subscription?.status).toBe('active');
    expect(subscription?.currentPeriodEnd).toBe('2027-03-06T03:00:00.000Z');
    expect(payments.filter((payment) => payment.kind === 'renewal')).toHaveLength(3);
  });

  it('해지를 예약해도 기간 안에는 이용하고, 기간이 지나면 만료되며 다시 구독할 수 있다', async () => {
    await subscribe(client, USER, 'basic', NOW);
    expect(await cancelSubscription(client, USER, NOW)).toBe('ok');
    expect((await data()).subscription).toMatchObject({ status: 'active', cancelAtPeriodEnd: true });

    const after = LATER(1);
    const expired = await data(after);
    expect(expired.subscription?.status).toBe('expired');
    expect(expired.payments).toHaveLength(1);

    expect(await subscribe(client, USER, 'premium', after)).toBe('ok');
    expect((await data(after)).subscription).toMatchObject({ plan: 'premium', status: 'active' });
  });

  it('해지 예약을 취소하면 계속 갱신된다', async () => {
    await subscribe(client, USER, 'basic', NOW);
    await cancelSubscription(client, USER, NOW);
    expect(await resumeSubscription(client, USER, NOW)).toBe('ok');
    expect((await data(LATER(1))).subscription?.status).toBe('active');
  });

  it('상위 이용권은 바로 적용하고 차액을 결제한다', async () => {
    await subscribe(client, USER, 'basic', NOW);
    expect(await changePlan(client, USER, 'premium', NOW)).toBe('ok');
    const { subscription, payments } = await data();
    expect(subscription?.plan).toBe('premium');
    expect(payments.find((payment) => payment.kind === 'upgrade')?.amount).toBe(6000);
  });

  it('하위 이용권은 다음 결제일부터 적용하고, 그 전에 취소할 수 있다', async () => {
    await subscribe(client, USER, 'premium', NOW);
    expect(await changePlan(client, USER, 'basic', NOW)).toBe('ok');
    expect((await data()).subscription).toMatchObject({ plan: 'premium', pendingPlan: 'basic' });

    const renewed = await data(LATER(1));
    expect(renewed.subscription).toMatchObject({ plan: 'basic', pendingPlan: null });
    expect(renewed.payments.find((payment) => payment.kind === 'renewal')?.amount).toBe(7900);
  });

  it('구독이 없거나 해지 예약 중이면 이용권을 바꿀 수 없다', async () => {
    expect(await changePlan(client, USER, 'premium', NOW)).toBe('no_subscription');
    expect(await cancelSubscription(client, USER, NOW)).toBe('no_subscription');
    await subscribe(client, USER, 'basic', NOW);
    await cancelSubscription(client, USER, NOW);
    expect(await changePlan(client, USER, 'premium', NOW)).toBe('invalid_state');
  });

  it('회원마다 구독을 따로 관리한다', async () => {
    await subscribe(client, USER, 'basic', NOW);
    expect((await getSubscriptionData(client, 'user-2', NOW)).subscription).toBeNull();
  });
});
