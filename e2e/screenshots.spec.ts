import { expect, test } from '@playwright/test';

// README 스크린샷을 만듭니다. `pnpm screenshots`로 실행합니다.
test.skip(!process.env.SCREENSHOTS, 'SCREENSHOTS=1일 때만 실행합니다.');

const base = 'http://localhost:4310';
const shot = (name: string) => ({ path: `docs/images/${name}.jpg`, type: 'jpeg' as const, quality: 80 });

test('화면 캡처', async ({ browser }) => {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await desktop.newPage();
  await page.goto(`${base}/`);
  await expect(page.getByRole('link', { name: '마지막 상영' })).toBeVisible();
  await page.screenshot(shot('home-dark'));

  await page.goto(`${base}/reviews/sample-last-screening`);
  await expect(page.getByAltText('마지막 상영 포스터')).toBeVisible();
  await page.screenshot(shot('detail-dark'));
  await desktop.close();

  const light = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  const lightPage = await light.newPage();
  await lightPage.goto(`${base}/`);
  await expect(lightPage.getByRole('link', { name: '마지막 상영' })).toBeVisible();
  await lightPage.screenshot(shot('home-light'));

  await lightPage.goto(`${base}/reviews/new`);
  await lightPage.screenshot(shot('write-light'));
  await light.close();
});
