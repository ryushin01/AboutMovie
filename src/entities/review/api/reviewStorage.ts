import { createStore, del, entries, get, set, setMany } from 'idb-keyval';
import { createId } from '@/shared/lib/createId';
import { seedReviews } from '../model/seed';
import type { Review, ReviewInput } from '../model/types';

// 이미지가 localStorage 용량을 넘기 쉬우므로 IndexedDB에 저장합니다.
const store = createStore('about-movie', 'reviews');
const SEEDED_KEY = '__seeded__';

async function ensureSeeded() {
  if (await get(SEEDED_KEY, store)) return;
  await setMany([...seedReviews.map((r): [string, Review] => [r.id, r]), [SEEDED_KEY, true]], store);
}

export async function listReviews(): Promise<Review[]> {
  await ensureSeeded();
  const rows = await entries<string, Review | true>(store);
  return rows
    .filter(([key]) => key !== SEEDED_KEY)
    .map(([, review]) => review as Review)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getReview(id: string): Promise<Review | null> {
  await ensureSeeded();
  if (id === SEEDED_KEY) return null;
  return (await get<Review>(id, store)) ?? null;
}

export async function saveReview(input: ReviewInput): Promise<Review> {
  await ensureSeeded();
  const now = new Date().toISOString();
  const existing = input.id ? await get<Review>(input.id, store) : undefined;
  const review: Review = {
    ...input,
    id: input.id ?? createId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await set(review.id, review, store);
  return review;
}

export async function deleteReview(id: string): Promise<void> {
  await del(id, store);
}
