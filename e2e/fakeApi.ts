import type { Page, Route } from '@playwright/test';

// vite preview에는 함수가 없으므로 API를 브라우저 앞에서 대신합니다. 서버 쪽은 netlify/lib 테스트와 live.spec이 검사합니다.

export interface FakeReview {
  id: string;
  title: string;
  year: number;
  rating: number;
  genres: string[];
  poster: string;
  body: unknown;
  createdAt: string;
  updatedAt: string;
}

const FILMS: [string, string, number, string, ...string[]][] = [
  ['last-screening', '마지막 상영', 5, '드라마'],
  ['winter-route', '겨울의 항로', 4, '드라마'],
  ['neon-rain', '네온 레인', 3, '스릴러'],
  ['silent-floor', '조용한 층', 4, '스릴러'],
  ['glass-orbit', '유리 궤도', 5, 'SF', '드라마'],
  ['second-sun', '두 번째 태양', 3, 'SF'],
  ['spring-letter', '봄의 답장', 4, '로맨스'],
  ['midnight-bakery', '자정의 빵집', 3, '로맨스'],
  ['wrong-wedding', '엉뚱한 결혼식', 4, '코미디'],
  ['office-picnic', '사무실 소풍', 2, '코미디'],
  ['iron-harbor', '철의 항구', 4, '액션'],
  ['night-express', '야간 급행', 3, '액션'],
  ['salt-makers', '소금을 만드는 사람들', 5, '다큐멘터리'],
  ['city-of-pigeons', '비둘기의 도시', 3, '다큐멘터리'],
  ['paper-whale', '종이 고래', 5, '애니메이션'],
  ['little-lighthouse', '작은 등대', 4, '애니메이션'],
];

export const seedReviews = (): FakeReview[] =>
  FILMS.map(([id, title, rating, genre, ...more], index) => {
    const at = new Date(Date.UTC(2026, 9, 28 - index, 9)).toISOString();
    return {
      id: `sample-${id}`,
      title,
      year: 2025,
      rating,
      genres: [genre, ...more],
      poster: `/seed/${id}-poster.svg`,
      body: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: `${title}에 대한 가상의 리뷰입니다. 화면이 오래 남는다.` }],
          },
          { type: 'image', attrs: { src: `/seed/${id}-scene.svg`, alt: `${title}의 한 장면` } },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '결말은 호불호가 갈리겠지만 볼 가치가 충분하다.' }],
          },
          { type: 'image', attrs: { src: `/seed/${id}-scene-2.svg`, alt: `${title}의 다른 장면` } },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '다시 보면 처음에 놓친 것들이 보인다.' }],
          },
        ],
      },
      createdAt: at,
      updatedAt: at,
    };
  });

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==',
  'base64',
);

interface Options {
  isCritic?: boolean;
  reviews?: FakeReview[];
}

export async function installFakeApi(page: Page, { isCritic = true, reviews = seedReviews() }: Options = {}) {
  const state = { reviews, uploads: new Map<string, Buffer>(), posts: 0, delay: 0 };

  await page.route('**/api/me', (route) => route.fulfill({ json: { isCritic } }));

  await page.route('**/api/images', async (route: Route) => {
    if (!isCritic) return route.fulfill({ status: 401, json: { error: 'unauthorized' } });
    const key = `fake-${state.uploads.size + 1}.png`;
    state.uploads.set(key, Buffer.from(route.request().postDataJSON().data, 'base64'));
    return route.fulfill({ status: 201, json: { url: `/api/images/${key}` } });
  });
  await page.route('**/api/images/*', (route) => {
    const key = new URL(route.request().url()).pathname.split('/').pop()!;
    return route.fulfill({ contentType: 'image/jpeg', body: state.uploads.get(key) ?? png });
  });

  await page.route('**/api/reviews', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: state.reviews });
    if (!isCritic) return route.fulfill({ status: 401, json: { error: 'unauthorized' } });
    state.posts += 1;
    if (state.delay) await new Promise((resolve) => setTimeout(resolve, state.delay));
    const now = new Date().toISOString();
    const created = {
      ...route.request().postDataJSON(),
      id: `new-${state.posts}`,
      createdAt: now,
      updatedAt: now,
    };
    state.reviews.unshift(created);
    return route.fulfill({ status: 201, json: created });
  });
  await page.route('**/api/reviews/*', async (route) => {
    const id = decodeURIComponent(new URL(route.request().url()).pathname.split('/').pop()!);
    const index = state.reviews.findIndex((review) => review.id === id);
    if (index < 0) return route.fulfill({ status: 404, json: { error: 'not_found' } });
    const method = route.request().method();
    if (method !== 'GET' && !isCritic) return route.fulfill({ status: 401, json: { error: 'unauthorized' } });
    if (method === 'DELETE') {
      state.reviews.splice(index, 1);
      return route.fulfill({ status: 204 });
    }
    if (method === 'PUT')
      state.reviews[index] = { ...state.reviews[index], ...route.request().postDataJSON() };
    return route.fulfill({ json: state.reviews[index] });
  });

  return state;
}
