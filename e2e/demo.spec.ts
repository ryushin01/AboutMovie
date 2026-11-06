import { writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import gifenc from 'gifenc';
import { PNG } from 'pngjs';
import { installFakeApi, MEMBER } from './fakeApi';

// README 시연 GIF를 만듭니다. `pnpm demo-gif`로 실행합니다.
test.skip(!process.env.DEMO, 'DEMO=1일 때만 실행합니다.');

const { applyPalette, GIFEncoder, quantize } = gifenc;

const WIDTH = 960;
const HEIGHT = 600;

test('시연 GIF 만들기', async ({ browser, baseURL }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({
    baseURL,
    viewport: { width: WIDTH, height: HEIGHT },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await installFakeApi(page, { user: MEMBER });
  const gif = GIFEncoder();

  /** 지금 화면을 delay(ms) 동안 보여 주는 프레임으로 넣습니다. */
  const shot = async (delay: number) => {
    const { data } = PNG.sync.read(await page.screenshot());
    const rgba = new Uint8Array(data);
    const palette = quantize(rgba, 256);
    gif.writeFrame(applyPalette(rgba, palette), WIDTH, HEIGHT, { palette, delay });
  };

  await page.goto('/');
  await expect(page.getByRole('region', { name: '국내 첫 공개' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await shot(2000);
  await page.mouse.wheel(0, 460);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  await page.getByRole('button', { name: '국내 첫 공개 다음 목록' }).click();
  await page.waitForTimeout(300);
  await shot(1400);

  await page.getByRole('navigation', { name: '주요 메뉴' }).getByRole('link', { name: '영화' }).click();
  await expect(page.locator('main output')).toHaveText('영화 36편');
  await page.waitForLoadState('networkidle');
  await shot(1200);

  await page.getByLabel('장르').selectOption('SF');
  await page.getByLabel('국내 첫 공개작만 보기').check();
  await shot(1200);
  await page.getByRole('button', { name: '적용' }).click();
  await expect(page.locator('main output')).toContainText('영화 2편');
  await page.getByRole('link', { name: '유리 궤도' }).scrollIntoViewIfNeeded();
  await page.waitForLoadState('networkidle');
  await shot(1600);

  await page.getByRole('link', { name: '유리 궤도' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '유리 궤도' })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('networkidle');
  await shot(2000);

  await page.getByRole('link', { name: '이용권 구매하고 보기' }).click();
  await expect(page.getByText('월 10,900원')).toBeVisible();
  await shot(1600);
  await page.getByRole('link', { name: '스탠다드 시작하기' }).click();
  await expect(page.getByRole('button', { name: '10,900원 가상 결제' })).toBeVisible();
  await shot(1400);
  await page.getByRole('button', { name: '10,900원 가상 결제' }).click();
  await expect(page.getByRole('heading', { name: '스탠다드 이용권 이용 중' })).toBeVisible();
  await shot(1800);

  await page.goto('/movies/glass-orbit');
  await page.getByRole('link', { name: '재생' }).click();
  await expect(page.getByRole('slider', { name: '재생 위치' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await shot(2400);

  gif.finish();
  writeFileSync('docs/images/demo.gif', gif.bytes());
  await context.close();
});
