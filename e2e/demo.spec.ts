import { writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import gifenc from 'gifenc';
import { PNG } from 'pngjs';
import { installFakeApi } from './fakeApi';

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
  await installFakeApi(page);
  const gif = GIFEncoder();

  /** 지금 화면을 delay(ms) 동안 보여 주는 프레임으로 넣습니다. */
  const shot = async (delay: number) => {
    const { data } = PNG.sync.read(await page.screenshot());
    const rgba = new Uint8Array(data);
    const palette = quantize(rgba, 256);
    gif.writeFrame(applyPalette(rgba, palette), WIDTH, HEIGHT, { palette, delay });
  };

  /** 가상의 이미지를 만듭니다. 실제 영화 이미지를 쓰지 않습니다. */
  const image = async (name: string, width: number, height: number, from: string, to: string) => {
    const base64 = await page.evaluate(
      ([w, h, start, end]) => {
        const canvas = document.createElement('canvas');
        canvas.width = Number(w);
        canvas.height = Number(h);
        const context2d = canvas.getContext('2d')!;
        const gradient = context2d.createLinearGradient(0, 0, Number(w), Number(h));
        gradient.addColorStop(0, String(start));
        gradient.addColorStop(1, String(end));
        context2d.fillStyle = gradient;
        context2d.fillRect(0, 0, Number(w), Number(h));
        context2d.fillStyle = 'rgba(255, 255, 255, 0.35)';
        context2d.beginPath();
        context2d.arc(Number(w) * 0.68, Number(h) * 0.34, Number(w) * 0.22, 0, Math.PI * 2);
        context2d.fill();
        return canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
      },
      [width, height, from, to] as const,
    );
    return { name, mimeType: 'image/jpeg', buffer: Buffer.from(base64, 'base64') };
  };

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2, name: '최신 리뷰' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await shot(1800);
  await page.getByRole('button', { name: '최신 리뷰 다음 목록' }).click();
  await page.waitForTimeout(300);
  await shot(1200);
  await page.mouse.wheel(0, 420);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  await page.waitForLoadState('networkidle');
  await shot(1400);

  await page.getByRole('link', { name: '리뷰 쓰기' }).click();
  await expect(page.getByRole('heading', { name: '리뷰 쓰기' })).toBeVisible();
  await page.getByLabel('영화 제목 (필수)').fill('새벽의 활주로');
  await page.getByLabel('개봉 연도 (필수)').fill('2026');
  await page.getByLabel('평점 (필수)').selectOption('5');
  await page.getByRole('checkbox', { name: '드라마' }).check();
  await page
    .getByLabel('포스터 이미지 (필수)')
    .setInputFiles(await image('poster.jpg', 1200, 1800, '#2b6e4f', '#0b1f18'));
  await page.getByAltText('선택한 포스터 미리보기').scrollIntoViewIfNeeded();
  await expect(page.getByAltText('선택한 포스터 미리보기')).toBeVisible();
  await shot(1400);

  const editor = page.getByRole('textbox', { name: '리뷰 내용 (필수)' });
  await page.getByRole('button', { name: '제목', exact: true }).click();
  await expect(editor).toBeFocused();
  await page.keyboard.type('조용히 숨을 고르는 영화');
  await page.keyboard.press('Enter');
  await page.keyboard.type('동이 트는 활주로에서 시작해 ');
  await page.getByRole('button', { name: '굵게' }).click();
  await expect(editor).toBeFocused();
  await page.keyboard.type('끝까지 흔들리지 않는다.');
  await page.getByRole('button', { name: '굵게' }).click();
  await expect(editor).toBeFocused();
  await editor.scrollIntoViewIfNeeded();
  await shot(1600);

  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '이미지', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '이미지 넣기' });
  await dialog
    .getByLabel('이미지 파일 (필수)')
    .setInputFiles(await image('scene.jpg', 1920, 1080, '#d98b2e', '#1a2a3a'));
  await dialog.getByLabel('이미지 설명 (필수)').fill('동이 트는 활주로 위로 해가 뜨는 풍경');
  await shot(1400);
  await dialog.getByRole('button', { name: '넣기' }).click();
  await expect(editor.getByAltText('동이 트는 활주로 위로 해가 뜨는 풍경')).toBeVisible();
  await shot(1200);

  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '새벽의 활주로' })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(1600);

  await page.getByRole('button', { name: '라이트 모드' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await shot(1400);

  await page.getByRole('link', { name: 'AboutMovie' }).click();
  await expect(page.getByRole('heading', { level: 2, name: '새벽의 활주로' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await shot(2400);

  gif.finish();
  writeFileSync('docs/images/demo.gif', gif.bytes());
  await context.close();
});
