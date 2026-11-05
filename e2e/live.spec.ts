import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// 배포된 사이트를 검사합니다. `pnpm test:live`로 실행하며, 배포 후 Live check 워크플로가 실행합니다.
// 운영 데이터를 바꾸지 않도록 읽기와 권한 거부만 확인합니다.
test.skip(!process.env.LIVE, 'LIVE=1일 때만 실행합니다.');

// 다른 주소를 검사하려면 LIVE_URL로 넘깁니다.
const SITE = (process.env.LIVE_URL ?? 'https://about-movie-ryushin.netlify.app').replace(/\/$/, '');

test('배포된 사이트를 방문자로 읽을 수 있다', async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // 2152398850은 Firefox의 NS_BINDING_ABORTED로, 페이지를 옮기며 받던 글꼴을 취소했다는 기록입니다.
  page.on('console', (message) => {
    if (message.type() === 'error' && !/downloadable font:.*status=2152398850/.test(message.text())) {
      errors.push(message.text());
    }
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && /\/(assets|seed|api)\//.test(response.url())) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(`${SITE}/`);
  await expect(page.getByRole('heading', { level: 2, name: '최신 리뷰' })).toBeVisible();
  await expect(page.getByRole('link', { name: '리뷰 쓰기' })).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const visible = [...document.images].filter((img) => img.loading !== 'lazy');
        return visible.length > 0 && visible.every((img) => img.naturalWidth > 0);
      }),
    )
    .toBe(true);
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);

  await page.getByRole('region', { name: '최신 리뷰' }).getByRole('link').first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: '수정' })).toHaveCount(0);

  await page.goto(`${SITE}/reviews/new`);
  await expect(page.getByRole('heading', { level: 1, name: '운영자 로그인' })).toBeVisible();

  expect(errors).toEqual([]);
});

test('로그인하지 않으면 쓰기 요청을 거부한다', async ({ request }) => {
  const options = { headers: { Origin: SITE } };
  expect((await request.get(`${SITE}/api/me`)).status()).toBe(200);
  expect(await (await request.get(`${SITE}/api/me`)).json()).toEqual({ isCritic: false });
  expect((await request.post(`${SITE}/api/reviews`, { ...options, data: {} })).status()).toBe(401);
  expect(
    (await request.put(`${SITE}/api/reviews/sample-last-screening`, { ...options, data: {} })).status(),
  ).toBe(401);
  expect((await request.delete(`${SITE}/api/reviews/sample-last-screening`, options)).status()).toBe(401);
  expect((await request.post(`${SITE}/api/images`, { ...options, data: { data: 'eA==' } })).status()).toBe(
    401,
  );
  // 샘플 글이 그대로 있어야 합니다.
  expect((await request.get(`${SITE}/api/reviews/sample-last-screening`)).status()).toBe(200);
});

test('다른 사이트에서 온 쓰기 요청을 거부한다', async ({ request }) => {
  const response = await request.post(`${SITE}/api/reviews`, {
    headers: { Origin: 'https://evil.example' },
    data: {},
  });
  expect(response.status()).toBe(403);
});
