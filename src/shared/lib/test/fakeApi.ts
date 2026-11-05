import { vi } from 'vitest';

type Row = Record<string, unknown> & { id: string };

export const sampleReview = (patch: Partial<Row> = {}): Row => ({
  id: 'sample-1',
  title: '마지막 상영',
  year: 2025,
  rating: 5,
  genre: '드라마',
  poster: '/seed/a-poster.svg',
  body: {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: '문 닫는 극장의 마지막 밤.' }] },
      { type: 'image', attrs: { src: '/seed/a-scene.svg', alt: '붉은 노을 풍경' } },
    ],
  },
  createdAt: '2026-10-28T09:00:00.000Z',
  updatedAt: '2026-10-28T09:00:00.000Z',
  ...patch,
});

interface Options {
  reviews?: Row[];
  isCritic?: boolean;
}

/** fetch를 메모리 안의 API로 바꿉니다. fail에 넣은 요청은 500으로 답합니다. */
export function installFakeApi({ reviews = [sampleReview()], isCritic = true }: Options = {}) {
  const state = {
    reviews: [...reviews],
    isCritic,
    calls: [] as { method: string; path: string; body?: unknown }[],
    fail: null as null | ((method: string, path: string) => boolean),
    hold: null as null | Promise<void>,
  };

  vi.stubGlobal('fetch', async (input: string, init: RequestInit = {}) => {
    const method = init.method ?? 'GET';
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
    state.calls.push({ method, path: input, body });
    await state.hold;
    if (state.fail?.(method, input)) return new Response(null, { status: 500 });

    if (input === '/api/me') return Response.json({ isCritic: state.isCritic });
    if (input === '/api/images') return Response.json({ url: '/api/images/uploaded.png' }, { status: 201 });
    if (input === '/api/reviews') {
      if (method === 'GET') return Response.json(state.reviews);
      const created = {
        ...body,
        id: 'new-id',
        createdAt: '2026-11-01T00:00:00.000Z',
        updatedAt: '2026-11-01T00:00:00.000Z',
      };
      state.reviews.unshift(created);
      return Response.json(created, { status: 201 });
    }
    const id = decodeURIComponent(input.replace('/api/reviews/', ''));
    const index = state.reviews.findIndex((review) => review.id === id);
    if (index < 0) return Response.json({ error: 'not_found' }, { status: 404 });
    if (method === 'DELETE') {
      state.reviews.splice(index, 1);
      return new Response(null, { status: 204 });
    }
    if (method === 'PUT') state.reviews[index] = { ...state.reviews[index], ...body };
    return Response.json(state.reviews[index]);
  });

  return { state };
}
