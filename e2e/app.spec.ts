import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// 1x1 PNG
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==',
  'base64',
);
const image = (name: string) => ({ name, mimeType: 'image/png', buffer: png });

async function expectNoAxeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

async function fillRequired(page: Page, title: string) {
  await page.getByLabel('영화 제목 (필수)').fill(title);
  await page.getByLabel('개봉 연도 (필수)').fill('2024');
  await page.getByLabel('평점 (필수)').selectOption('4');
  await page.getByLabel('포스터 이미지 (필수)').setInputFiles(image('poster.png'));
  await expect(page.getByAltText('선택한 포스터 미리보기')).toBeVisible();
  await page.getByLabel('리뷰 내용 (필수)').fill('첫 문단\n\n둘째 문단');
}

test('작성, 수정, 삭제 흐름', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '리뷰 쓰기' }).click();
  await expect(page).toHaveTitle('리뷰 쓰기 | AboutMovie');

  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByLabel('영화 제목 (필수)')).toBeFocused();

  await fillRequired(page, 'E2E 영화');
  await page.getByLabel('영화 속 장면 이미지').setInputFiles([image('a.png'), image('b.png')]);
  await page.getByLabel('장면 1 설명 (필수)').fill('첫 장면');
  await page.getByLabel('장면 2 설명 (필수)').fill('둘째 장면');
  await page.getByRole('button', { name: '저장' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'E2E 영화' })).toBeVisible();
  await expect(page.getByAltText('E2E 영화 포스터')).toBeVisible();
  await expect(page.getByAltText('첫 장면')).toBeVisible();
  await expect(page.getByAltText('둘째 장면')).toBeVisible();

  // 새로고침해도 남아 있어야 합니다.
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'E2E 영화' })).toBeVisible();

  await page.getByRole('link', { name: '수정' }).click();
  await page.getByLabel('영화 제목 (필수)').fill('고친 영화');
  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '고친 영화' })).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: '삭제' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText('리뷰 3편')).toBeVisible();
  await expect(page.getByRole('link', { name: '고친 영화' })).toHaveCount(0);
});

test('저장을 연달아 눌러도 한 번만 저장한다', async ({ page }) => {
  await page.goto('/reviews/new');
  await fillRequired(page, '중복 확인');
  await page.getByRole('button', { name: '저장' }).dblclick();
  await expect(page.getByRole('heading', { level: 1, name: '중복 확인' })).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('link', { name: '중복 확인' })).toHaveCount(1);
});

test('다크 모드를 저장하고 시스템 설정을 따른다', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('/');
  const theme = () => page.evaluate(() => document.documentElement.dataset.theme);

  expect(await theme()).toBe('dark');
  await page.getByRole('button', { name: '다크 모드' }).click();
  expect(await theme()).toBe('light');
  await page.reload();
  expect(await theme()).toBe('light');
  await expect(page.getByRole('button', { name: '다크 모드' })).toHaveAttribute('aria-pressed', 'false');
  await context.close();
});

test('키보드로 본문 바로가기를 쓸 수 있다', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '본문 바로가기' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('없는 주소와 없는 리뷰를 안내한다', async ({ page }) => {
  await page.goto('/nope');
  await expect(page.getByRole('heading', { name: '페이지를 찾을 수 없습니다' })).toBeVisible();
  await page.goto('/reviews/nope');
  await expect(page.getByRole('heading', { name: '리뷰를 찾을 수 없습니다' })).toBeVisible();
  await page.goto('/reviews/nope/edit');
  await expect(page.getByRole('heading', { name: '리뷰를 찾을 수 없습니다' })).toBeVisible();
});

for (const colorScheme of ['light', 'dark'] as const) {
  for (const [width, height] of [
    [320, 640],
    [1440, 900],
    [2200, 1200],
  ] as const) {
    test(`${colorScheme} ${width}px: 넘침과 접근성`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ baseURL, colorScheme, viewport: { width, height } });
      const page = await context.newPage();

      await page.goto('/');
      await expect(page.getByRole('link', { name: '마지막 상영' })).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectNoAxeViolations(page);

      await page.goto('/reviews/sample-last-screening');
      await expect(page.getByAltText('마지막 상영 포스터')).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectNoAxeViolations(page);

      await page.goto('/reviews/new');
      await page.getByRole('button', { name: '저장' }).click();
      await expectNoHorizontalOverflow(page);
      await expectNoAxeViolations(page);

      await context.close();
    });
  }
}

test('긴 제목도 넘치지 않는다', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 360, height: 740 } });
  const page = await context.newPage();
  await page.goto('/reviews/new');
  await fillRequired(page, 'A'.repeat(100));
  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A'.repeat(100));
  await expectNoHorizontalOverflow(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await context.close();
});

test('HTTPS가 아닌 주소에서도 장면 이미지와 함께 저장한다', async ({ page }) => {
  // randomUUID는 보안 컨텍스트에서만 제공됩니다.
  await page.addInitScript(() => {
    delete (Crypto.prototype as Partial<Crypto>).randomUUID;
  });
  await page.goto('/reviews/new');
  await fillRequired(page, '비보안 주소');
  await page.getByLabel('영화 속 장면 이미지').setInputFiles(image('a.png'));
  await page.getByLabel('장면 1 설명 (필수)').fill('장면', { timeout: 3000 });
  await page.getByRole('button', { name: '저장' }).click({ timeout: 3000 });
  await expect(page.getByRole('heading', { level: 1, name: '비보안 주소' })).toBeVisible({ timeout: 3000 });
});

test('큰 이미지를 줄여서 저장한다', async ({ page }) => {
  await page.goto('/reviews/new');
  const makePng = (width: number, height: number) =>
    page.evaluate(
      ([w, h]) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const context = canvas.getContext('2d')!;
        const gradient = context.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, '#a82c0c');
        gradient.addColorStop(1, '#15130f');
        context.fillStyle = gradient;
        context.fillRect(0, 0, w, h);
        return canvas.toDataURL('image/png').split(',')[1];
      },
      [width, height],
    );
  const file = (name: string, base64: string) => ({
    name,
    mimeType: 'image/png',
    buffer: Buffer.from(base64, 'base64'),
  });
  const size = (alt: string) =>
    page.getByAltText(alt).evaluate((img: HTMLImageElement) => ({
      width: img.naturalWidth,
      height: img.naturalHeight,
      type: img.src.slice(0, 15),
    }));

  await page.getByLabel('포스터 이미지 (필수)').setInputFiles(file('poster.png', await makePng(3000, 4500)));
  await expect(page.getByAltText('선택한 포스터 미리보기')).toBeVisible();
  expect(await size('선택한 포스터 미리보기')).toEqual({
    width: 1000,
    height: 1500,
    type: 'data:image/jpeg',
  });

  await page.getByLabel('영화 속 장면 이미지').setInputFiles(file('scene.png', await makePng(4000, 2250)));
  await expect(page.getByAltText('장면 1 미리보기')).toBeVisible();
  expect(await size('장면 1 미리보기')).toEqual({ width: 1920, height: 1080, type: 'data:image/jpeg' });
});

test('표시할 수 없는 이미지는 안내하고 다음 동작을 막지 않는다', async ({ page }) => {
  await page.goto('/reviews/new');
  const broken = { name: 'photo.heic', mimeType: 'image/heic', buffer: Buffer.from('not an image') };

  await page.getByLabel('포스터 이미지 (필수)').setInputFiles(broken);
  await expect(
    page.getByText('오류: photo.heic: 표시할 수 없는 이미지 형식입니다.', { exact: false }),
  ).toBeVisible();

  await page.getByLabel('영화 속 장면 이미지').setInputFiles([broken, image('ok.png')]);
  await expect(page.getByLabel('장면 1 설명 (필수)')).toBeVisible();
  await expect(page.getByLabel('장면 2 설명 (필수)')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '저장' })).toBeEnabled();
});

// 1mm = 96/25.4px
const MIN_DIAGONAL_PX = (6 * 96) / 25.4;

test('모든 컨트롤의 대각선 길이가 6mm 이상이다', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 360, height: 740 } });
  const page = await context.newPage();
  for (const path of ['/', '/reviews/sample-last-screening', '/reviews/new']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('output:not(:empty)')).toHaveCount(0);
    const sizes = await page.locator('a, button, input, select, textarea').evaluateAll((elements) =>
      elements.map((element) => {
        const { width, height } = element.getBoundingClientRect();
        return { name: element.textContent || element.id, diagonal: Math.hypot(width, height) };
      }),
    );
    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes.filter((size) => size.diagonal < MIN_DIAGONAL_PX)).toEqual([]);
  }
  await context.close();
});

test('키보드만으로 리뷰를 작성하고 상세로 이동한다', async ({ page }) => {
  await page.goto('/reviews/new');
  await page.getByRole('heading', { name: '리뷰 쓰기' }).waitFor();
  await page.getByLabel('영화 제목 (필수)').focus();
  await page.keyboard.type('키보드 영화');
  await page.keyboard.press('Tab');
  await page.keyboard.type('2024');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('평점 (필수)')).toBeFocused();
  await page.keyboard.type('4');
  await page.keyboard.press('Tab');

  await expect(page.getByLabel('포스터 이미지 (필수)')).toBeFocused();
  const chooser = page.waitForEvent('filechooser');
  await page.keyboard.press('Enter');
  await (await chooser).setFiles(image('poster.png'));
  await expect(page.getByAltText('선택한 포스터 미리보기')).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('리뷰 내용 (필수)')).toBeFocused();
  await page.keyboard.type('키보드로 쓴 리뷰');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('영화 속 장면 이미지')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '저장' })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { level: 1, name: '키보드 영화' })).toBeVisible();
  await expect(page.getByRole('main')).toBeFocused();
});

test('작성 중 나가면 확인하고, 저장 후에는 묻지 않는다', async ({ page }) => {
  await page.goto('/reviews/new');
  const dialogs: string[] = [];
  let accept = false;
  page.on('dialog', (dialog) => {
    dialogs.push(dialog.message());
    return accept ? dialog.accept() : dialog.dismiss();
  });

  // 입력 전에는 묻지 않습니다.
  await page.getByRole('link', { name: 'AboutMovie' }).click();
  await expect(page).toHaveURL('/');
  expect(dialogs).toEqual([]);

  await page.getByRole('link', { name: '리뷰 쓰기' }).click();
  await page.getByLabel('영화 제목 (필수)').fill('쓰는 중');

  await page.getByRole('link', { name: 'AboutMovie' }).click();
  await expect.poll(() => dialogs.length).toBe(1);
  await expect(page).toHaveURL('/reviews/new');
  await expect(page.getByLabel('영화 제목 (필수)')).toHaveValue('쓰는 중');

  accept = true;
  await page.getByRole('link', { name: 'AboutMovie' }).click();
  await expect(page).toHaveURL('/');
  expect(dialogs).toHaveLength(2);

  await page.getByRole('link', { name: '리뷰 쓰기' }).click();
  await fillRequired(page, '저장 후 이동');
  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '저장 후 이동' })).toBeVisible();
  expect(dialogs).toHaveLength(2);
});

test('다른 탭의 변경을 바로 반영한다', async ({ context }) => {
  const list = await context.newPage();
  await list.goto('/');
  await expect(list.getByText('리뷰 3편')).toBeVisible();

  const writer = await context.newPage();
  await writer.goto('/reviews/new');
  await fillRequired(writer, '다른 탭 영화');
  await writer.getByRole('button', { name: '저장' }).click();
  await expect(writer.getByRole('heading', { level: 1, name: '다른 탭 영화' })).toBeVisible();

  await expect(list.getByRole('link', { name: '다른 탭 영화' })).toBeVisible();
  await expect(list.getByText('리뷰 4편')).toBeVisible();
});

test('목록과 상세 화면에서 포스터와 장면이 잘리지 않는다', async ({ page }) => {
  await page.goto('/reviews/new');
  // 4:1 비율로 일부러 틀에 맞지 않는 이미지입니다.
  const wide = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 200;
    canvas.getContext('2d')!.fillRect(0, 0, 800, 200);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const file = { name: 'wide.png', mimeType: 'image/png', buffer: Buffer.from(wide, 'base64') };

  await page.getByLabel('영화 제목 (필수)').fill('와이드');
  await page.getByLabel('개봉 연도 (필수)').fill('2024');
  await page.getByLabel('평점 (필수)').selectOption('4');
  await page.getByLabel('포스터 이미지 (필수)').setInputFiles(file);
  await expect(page.getByAltText('선택한 포스터 미리보기')).toBeVisible();
  await page.getByLabel('리뷰 내용 (필수)').fill('본문');
  await page.getByLabel('영화 속 장면 이미지').setInputFiles(file);
  await page.getByLabel('장면 1 설명 (필수)').fill('넓은 장면');
  await page.getByRole('button', { name: '저장' }).click();

  const poster = page.getByAltText('와이드 포스터');
  await expect(poster).toBeVisible();
  const box = (await poster.boundingBox())!;
  expect(box.width / box.height).toBeCloseTo(4, 1);
  await expect(page.getByAltText('넓은 장면')).toHaveCSS('object-fit', 'contain');

  await page.getByRole('link', { name: 'AboutMovie' }).click();
  const cardPoster = page.getByAltText('와이드 포스터');
  await expect(cardPoster).toHaveCSS('object-fit', 'contain');
  const card = (await cardPoster.boundingBox())!;
  expect(card.width / card.height).toBeCloseTo(2 / 3, 1);
});
