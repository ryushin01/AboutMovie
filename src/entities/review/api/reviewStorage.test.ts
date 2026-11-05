import { describe, expect, it } from 'vitest';
import { deleteReview, getReview, listReviews, restoreSampleReviews, saveReview } from './reviewStorage';

const input = {
  title: '새 영화',
  year: 2026,
  rating: 4,
  poster: 'data:image/png;base64,AA',
  scenes: [],
  body: '본문',
};

describe('reviewStorage', () => {
  it('처음 읽으면 샘플을 넣고, 전부 지운 뒤에는 다시 넣지 않는다', async () => {
    const seeded = await listReviews();
    expect(seeded).toHaveLength(3);
    await Promise.all(seeded.map((r) => deleteReview(r.id)));
    await expect(listReviews()).resolves.toEqual([]);
  });

  it('저장, 수정, 삭제한다', async () => {
    const created = await saveReview(input);
    expect(created.id).toBeTruthy();

    const updated = await saveReview({ ...input, id: created.id, title: '고친 영화' });
    expect(updated.createdAt).toBe(created.createdAt);
    await expect(getReview(created.id)).resolves.toMatchObject({ title: '고친 영화' });

    await deleteReview(created.id);
    await expect(getReview(created.id)).resolves.toBeNull();
  });

  it('샘플을 되돌려도 직접 쓴 리뷰는 남는다', async () => {
    const mine = await saveReview(input);
    await deleteReview('sample-winter-route');
    await saveReview({ ...input, id: 'sample-under-neon', title: '고친 샘플' });

    await restoreSampleReviews();

    await expect(getReview('sample-winter-route')).resolves.not.toBeNull();
    await expect(getReview('sample-under-neon')).resolves.toMatchObject({ title: '네온 아래서' });
    await expect(getReview(mine.id)).resolves.toMatchObject({ title: input.title });
  });
});
