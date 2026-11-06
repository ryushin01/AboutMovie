import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// 배포된 사이트를 검사합니다. `pnpm test:live`로 실행하며, 배포 후 Live check 워크플로가 실행합니다.
// 운영 데이터를 바꾸지 않도록 읽기와 권한 거부만 확인합니다.
test.skip(!process.env.LIVE, 'LIVE=1일 때만 실행합니다.');

// 다른 주소를 검사하려면 LIVE_URL로 넘깁니다.
const SITE = (process.env.LIVE_URL ?? 'https://about-movie-ryushin.netlify.app').replace(/\/$/, '');

test('배포된 사이트를 메인, 리스트, 디테일 순서로 볼 수 있다', async ({ page }) => {
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
  const firstImports = page.getByRole('region', { name: '국내 첫 공개' });
  await expect(firstImports).toBeVisible();
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

  await firstImports.getByRole('link', { name: '국내 첫 공개 전체 보기' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '영화 찾기' })).toBeVisible();
  await page.getByLabel('검색어').fill('철의 항구');
  await page.getByRole('button', { name: '적용' }).click();
  await page.getByRole('link', { name: '철의 항구' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '철의 항구' })).toBeVisible();
  await expect(page.getByRole('link', { name: '로그인하고 보기' })).toBeVisible();

  expect(errors).toEqual([]);
});

test('로그인하지 않으면 이용권과 재생을 거부한다', async ({ request }) => {
  const options = { headers: { Origin: SITE } };
  expect(await (await request.get(`${SITE}/api/me`)).json()).toEqual({ user: null });
  expect((await request.get(`${SITE}/api/subscription`)).status()).toBe(401);
  expect(
    (await request.post(`${SITE}/api/subscription`, { ...options, data: { plan: 'basic' } })).status(),
  ).toBe(401);
  expect(
    (await request.patch(`${SITE}/api/subscription`, { ...options, data: { action: 'cancel' } })).status(),
  ).toBe(401);
  expect((await request.get(`${SITE}/api/movies/last-screening/playback`)).status()).toBe(401);
});

test('다른 사이트에서 온 이용권 요청을 거부한다', async ({ request }) => {
  const response = await request.post(`${SITE}/api/subscription`, {
    headers: { Origin: 'https://evil.example' },
    data: { plan: 'basic' },
  });
  expect(response.status()).toBe(403);
});
