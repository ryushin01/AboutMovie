import { expect, test } from '@playwright/test';

// README 스크린샷을 만듭니다. `pnpm screenshots`로 실행합니다.
test.skip(!process.env.SCREENSHOTS, 'SCREENSHOTS=1일 때만 실행합니다.');

const shot = (name: string) => ({ path: `docs/images/${name}.jpg`, type: 'jpeg' as const, quality: 80 });

test('화면 캡처', async ({ browser, baseURL }) => {
  const desktop = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const page = await desktop.newPage();
  await page.goto('/');
  await expect(page.getByRole('link', { name: '마지막 상영' })).toBeVisible();
  await page.screenshot(shot('home-dark'));

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 85 });
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/reviews/sample-last-screening');
  await expect(page.getByAltText('마지막 상영 포스터')).toBeVisible();
  await page.screenshot(shot('detail-dark'));
  await desktop.close();

  const light = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
  });
  const lightPage = await light.newPage();
  await lightPage.goto('/');
  await expect(lightPage.getByRole('link', { name: '마지막 상영' })).toBeVisible();
  await lightPage.screenshot(shot('home-light'));

  await lightPage.goto('/reviews/new');
  await lightPage.screenshot(shot('write-light'));
  await light.close();
});
