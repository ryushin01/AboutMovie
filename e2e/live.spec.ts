import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// 배포된 사이트를 검사합니다. `pnpm test:live`로 실행하며, 배포 워크플로가 배포 후에 실행합니다.
test.skip(!process.env.LIVE, 'LIVE=1일 때만 실행합니다.');

const SITE = 'https://ryushin01.github.io/AboutMovie';
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==',
  'base64',
);
const image = (name: string) => ({ name, mimeType: 'image/png', buffer: png });

test('배포된 사이트에서 전체 흐름이 동작한다', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // 직접 주소는 GitHub Pages가 404.html로 처리하므로 그 응답 기록은 제외합니다.
  page.on('console', (message) => {
    if (message.type() === 'error' && !/404|Failed to load resource/.test(message.text())) {
      errors.push(message.text());
    }
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().includes('/assets/')) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });

  await test.step('목록', async () => {
    await page.goto(`${SITE}/`);
    await expect(page.getByRole('link', { name: '마지막 상영' })).toBeVisible();
    expect(await page.evaluate(() => [...document.images].every((img) => img.naturalWidth > 0))).toBe(true);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((violation) => violation.id)).toEqual([]);
  });

  await test.step('직접 주소', async () => {
    await page.goto(`${SITE}/reviews/sample-last-screening`);
    await expect(page.getByRole('heading', { level: 1, name: '마지막 상영' })).toBeVisible();
    await page.goto(`${SITE}/nope`);
    await expect(page.getByRole('heading', { name: '페이지를 찾을 수 없습니다' })).toBeVisible();
  });

  await test.step('작성과 새로고침', async () => {
    await page.goto(`${SITE}/reviews/new`);
    await page.getByLabel('영화 제목 (필수)').fill('배포 확인');
    await page.getByLabel('개봉 연도 (필수)').fill('2026');
    await page.getByLabel('평점 (필수)').selectOption('4');
    await page.getByLabel('포스터 이미지 (필수)').setInputFiles(image('poster.png'));
    await expect(page.getByAltText('선택한 포스터 미리보기')).toBeVisible();
    await page.getByLabel('리뷰 내용 (필수)').fill('본문');
    await page.getByLabel('영화 속 장면 이미지').setInputFiles(image('scene.png'));
    await page.getByLabel('장면 1 설명 (필수)').fill('장면');
    await page.getByRole('button', { name: '저장' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '배포 확인' })).toBeVisible();
    expect(new URL(page.url()).pathname).toMatch(/^\/AboutMovie\/reviews\//);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: '배포 확인' })).toBeVisible();
  });

  await test.step('삭제와 샘플 되돌리기', async () => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: '삭제' }).click();
    await expect(page.getByRole('link', { name: '배포 확인' })).toHaveCount(0);
    await page.goto(`${SITE}/reviews/sample-winter-route`);
    await page.getByRole('button', { name: '삭제' }).click();
    await expect(page.getByRole('link', { name: '마지막 상영' })).toBeVisible();
    await expect(page.getByRole('link', { name: '겨울의 항로' })).toHaveCount(0);
    await page.getByRole('button', { name: '샘플 리뷰 되돌리기' }).click();
    await expect(page.getByRole('link', { name: '겨울의 항로' })).toBeVisible();
  });

  await test.step('다크 모드와 모바일 폭', async () => {
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.getByRole('button', { name: '다크 모드' }).click();
    await page.reload();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', before ?? '');
    await page.setViewportSize({ width: 360, height: 740 });
    await expect(page.getByRole('link', { name: '마지막 상영' })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  expect(errors).toEqual([]);
});
