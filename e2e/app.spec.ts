import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { installFakeApi } from './fakeApi';

// 1x1 PNG
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==',
  'base64',
);
const image = (name: string) => ({ name, mimeType: 'image/png', buffer: png });

/** Safari의 Tab은 기본 설정에서 링크와 버튼을 건너뛰고, Option+Tab은 모두 지나갑니다. */
const tabKey = (browserName: string) => (browserName === 'webkit' ? 'Alt+Tab' : 'Tab');

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

const editorOf = (page: Page) => page.getByRole('textbox', { name: '리뷰 내용 (필수)' });

async function fillRequired(page: Page, title: string) {
  await page.getByLabel('영화 제목 (필수)').fill(title);
  await page.getByLabel('개봉 연도 (필수)').fill('2024');
  await page.getByLabel('평점 (필수)').selectOption('4');
  await page.getByLabel('장르 (필수)').selectOption('드라마');
  await page.getByLabel('포스터 이미지 (필수)').setInputFiles(image('poster.png'));
  await expect(page.getByAltText('선택한 포스터 미리보기')).toBeVisible();
  await editorOf(page).click();
  await page.keyboard.type('첫 문단');
}

test.beforeEach(async ({ page }, testInfo) => {
  // 새 컨텍스트를 직접 만드는 테스트는 아래에서 따로 설치합니다.
  if (!testInfo.title.includes('[컨텍스트]')) await installFakeApi(page);
});

test('작성, 서식, 본문 이미지, 수정, 삭제 흐름', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '리뷰 쓰기' }).click();
  await expect(page).toHaveTitle('리뷰 쓰기 | AboutMovie');

  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByLabel('영화 제목 (필수)')).toBeFocused();

  await fillRequired(page, 'E2E 영화');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '굵게' }).click();
  await expect(page.getByRole('button', { name: '굵게' })).toHaveAttribute('aria-pressed', 'true');
  await expect(editorOf(page)).toBeFocused();
  await page.keyboard.type('굵은 문장');
  await page.getByRole('button', { name: '굵게' }).click();
  await expect(editorOf(page)).toBeFocused();
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: '링크' }).click();
  await page.getByLabel('주소').fill('javascript:alert(1)');
  await page.getByRole('dialog').getByRole('button', { name: '적용' }).click();
  await expect(page.getByText('오류: http 또는 https 주소를 입력해 주세요.')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: '취소' }).click();

  await page.getByRole('button', { name: '이미지', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '이미지 넣기' });
  await dialog.getByLabel('이미지 파일 (필수)').setInputFiles(image('scene.png'));
  await dialog.getByRole('button', { name: '넣기' }).click();
  await expect(dialog.getByText('오류: 이미지 설명을 입력해 주세요.')).toBeVisible();
  await dialog.getByLabel('이미지 설명 (필수)').fill('첫 장면');
  await dialog.getByRole('button', { name: '넣기' }).click();
  await expect(dialog).toBeHidden();
  await expect(editorOf(page).getByAltText('첫 장면')).toBeVisible();

  await page.getByRole('button', { name: '저장' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'E2E 영화' })).toBeVisible();
  await expect(page.getByAltText('E2E 영화 포스터')).toBeVisible();
  await expect(page.getByAltText('첫 장면')).toBeVisible();
  await expect(page.locator('main strong', { hasText: '굵은 문장' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'E2E 영화' })).toBeVisible();

  await page.getByRole('link', { name: '수정' }).click();
  await expect(editorOf(page)).toContainText('굵은 문장');
  await page.getByLabel('영화 제목 (필수)').fill('고친 영화');
  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '고친 영화' })).toBeVisible();

  page.once('dialog', (confirm) => confirm.accept());
  await page.getByRole('button', { name: '삭제' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 2, name: '최신 리뷰' })).toBeVisible();
  await expect(page.getByRole('link', { name: '고친 영화' })).toHaveCount(0);
});

test('방문자는 읽기만 할 수 있다 [컨텍스트]', async ({ page }) => {
  await installFakeApi(page, { isCritic: false });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2, name: '최신 리뷰' })).toBeVisible();
  await expect(page.getByRole('link', { name: '리뷰 쓰기' })).toHaveCount(0);

  await page.getByRole('link', { name: '유리 궤도' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: '유리 궤도' })).toBeVisible();
  await expect(page.getByRole('link', { name: '수정' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '삭제' })).toHaveCount(0);

  await page.goto('/reviews/new');
  await expect(page.getByRole('heading', { level: 1, name: '운영자 로그인' })).toBeVisible();
  await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
});

test('메일 링크의 토큰은 로그인 화면으로 넘긴다 [컨텍스트]', async ({ page }) => {
  await installFakeApi(page, { isCritic: false });
  await page.goto('/#recovery_token=abc');
  await expect(page).toHaveURL(/\/login#recovery_token=abc$|\/login$/);
  await expect(page.getByRole('heading', { level: 1, name: '운영자 로그인' })).toBeVisible();
});

test('화면이 넓을수록 한 줄에 카드가 더 많이 보인다 [컨텍스트]', async ({ browser, baseURL }) => {
  const visibleCards = async (width: number) => {
    const context = await browser.newContext({ baseURL, viewport: { width, height: 900 } });
    const page = await context.newPage();
    await installFakeApi(page);
    await page.goto('/');
    const row = page.getByRole('region', { name: '최신 리뷰' });
    await expect(row.getByRole('listitem').first()).toBeVisible();
    const count = await row.getByRole('list').evaluate((list) => {
      const { right } = list.getBoundingClientRect();
      return [...list.children].filter((card) => card.getBoundingClientRect().right <= right).length;
    });
    await context.close();
    return count;
  };

  const counts = [
    await visibleCards(375),
    await visibleCards(800),
    await visibleCards(1280),
    await visibleCards(1920),
  ];
  expect(counts).toEqual([...counts].sort((a, b) => a - b));
  expect(counts[0]).toBeGreaterThanOrEqual(2);
  expect(counts[3]).toBeGreaterThanOrEqual(7);
});

test('줄은 버튼과 키보드로 넘기고 포스터는 잘리지 않는다', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const row = page.getByRole('region', { name: '최신 리뷰' });
  const list = row.getByRole('list');
  await expect(list.getByRole('listitem').first()).toBeVisible();

  const previous = row.getByRole('button', { name: '최신 리뷰 이전 목록' });
  await expect(previous).toHaveAttribute('aria-disabled', 'true');
  await row.getByRole('button', { name: '최신 리뷰 다음 목록' }).click();
  await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
  await expect(previous).toHaveAttribute('aria-disabled', 'false');

  // 화면 밖 카드도 Tab으로 가면 보이는 곳으로 들어옵니다.
  await list.evaluate((el) => (el.scrollLeft = 0));
  const last = list.getByRole('link').last();
  await last.focus();
  await page.keyboard.press(tabKey(browserName));
  await last.focus();
  await expect(last).toBeInViewport();

  const poster = page.getByRole('img', { name: '마지막 상영 포스터' }).last();
  await expect(poster).toHaveCSS('object-fit', 'contain');
  await expectNoHorizontalOverflow(page);
});

test('저장을 연달아 눌러도 한 번만 저장한다 [컨텍스트]', async ({ page }) => {
  const state = await installFakeApi(page);
  state.delay = 300;
  await page.goto('/reviews/new');
  await fillRequired(page, '한 번만');
  await page.getByRole('button', { name: '저장' }).dblclick();
  await expect(page.getByRole('heading', { level: 1, name: '한 번만' })).toBeVisible();
  expect(state.posts).toBe(1);
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

test('키보드로 본문 바로가기를 쓸 수 있다', async ({ page, browserName }) => {
  await page.goto('/');
  await page.keyboard.press(tabKey(browserName));
  await expect(page.getByRole('link', { name: '본문 바로가기' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('main')).toHaveCSS('outline-style', 'solid');
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
    test(`${colorScheme} ${width}px: 넘침과 접근성 [컨텍스트]`, async ({ browser, baseURL }) => {
      // 호버 전환 중간 색을 재지 않도록 애니메이션을 끕니다.
      const context = await browser.newContext({
        baseURL,
        colorScheme,
        viewport: { width, height },
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      await installFakeApi(page);

      await page.goto('/');
      await expect(page.getByRole('heading', { level: 2, name: '최신 리뷰' })).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectNoAxeViolations(page);

      await page.goto('/reviews/sample-last-screening');
      await expect(page.getByAltText('마지막 상영 포스터')).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectNoAxeViolations(page);

      await page.goto('/reviews/new');
      await expect(editorOf(page)).toBeVisible();
      await page.getByRole('button', { name: '저장' }).click();
      await expectNoHorizontalOverflow(page);
      await expectNoAxeViolations(page);

      await page.getByRole('button', { name: '이미지', exact: true }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expectNoAxeViolations(page);
      await page.getByRole('dialog').getByRole('button', { name: '취소' }).click();

      await page.goto('/reviews/sample-last-screening/edit');
      await expect(page.getByLabel('영화 제목 (필수)')).toHaveValue('마지막 상영');
      await expect(editorOf(page)).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectNoAxeViolations(page);

      await page.goto('/login');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectNoAxeViolations(page);

      await page.goto('/nope');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectNoAxeViolations(page);

      await context.close();
    });
  }
}

test('긴 제목도 넘치지 않는다 [컨텍스트]', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 360, height: 740 } });
  const page = await context.newPage();
  await installFakeApi(page);
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

test('큰 이미지를 줄여서 올린다 [컨텍스트]', async ({ page }) => {
  const state = await installFakeApi(page);
  await page.goto('/reviews/new');
  const large = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 3000;
    canvas.height = 4500;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#336';
    context.fillRect(0, 0, 3000, 4500);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page
    .getByLabel('포스터 이미지 (필수)')
    .setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer: Buffer.from(large, 'base64') });
  const preview = page.getByAltText('선택한 포스터 미리보기');
  await expect(preview).toBeVisible();
  await expect.poll(() => preview.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBe(1500);
  expect(state.uploads.size).toBe(1);
});

test('표시할 수 없는 이미지는 안내하고 다음 동작을 막지 않는다', async ({ page }) => {
  await page.goto('/reviews/new');
  await page.getByLabel('포스터 이미지 (필수)').setInputFiles({
    name: 'photo.heic',
    mimeType: 'image/heic',
    buffer: Buffer.from('not-an-image'),
  });
  await expect(
    page.getByText('photo.heic: 표시할 수 없는 이미지 형식입니다.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: '저장' })).toBeEnabled();
});

// 1mm = 96/25.4px
const MIN_DIAGONAL_PX = (6 * 96) / 25.4;

test('모든 컨트롤의 대각선 길이가 6mm 이상이다 [컨텍스트]', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 360, height: 740 } });
  const page = await context.newPage();
  await installFakeApi(page);
  for (const path of ['/', '/reviews/sample-last-screening', '/reviews/new', '/login']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('output:not(:empty)')).toHaveCount(0);
    const sizes = await page
      .locator('main a, main button, main input, main select, header a, header button')
      .evaluateAll((elements) =>
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

test('키보드만으로 리뷰를 작성하고 상세로 이동한다', async ({ page, browserName }) => {
  await page.goto('/reviews/new');
  await page.getByRole('heading', { name: '리뷰 쓰기' }).waitFor();
  await expect(editorOf(page)).toBeVisible();
  await page.getByLabel('영화 제목 (필수)').focus();
  await page.keyboard.type('키보드 영화');
  await page.keyboard.press(tabKey(browserName));
  await page.keyboard.type('2024');
  await page.keyboard.press(tabKey(browserName));
  await expect(page.getByLabel('평점 (필수)')).toBeFocused();
  await page.getByLabel('평점 (필수)').selectOption('4');
  await page.keyboard.press(tabKey(browserName));
  await expect(page.getByLabel('장르 (필수)')).toBeFocused();
  await page.getByLabel('장르 (필수)').selectOption('SF');
  await page.keyboard.press(tabKey(browserName));

  const chooser = page.waitForEvent('filechooser');
  await expect(page.getByLabel('포스터 이미지 (필수)')).toBeFocused();
  await page.keyboard.press('Enter');
  await (await chooser).setFiles(image('poster.png'));
  await expect(page.getByAltText('선택한 포스터 미리보기')).toBeVisible();

  // 도구 모음은 한 번만 들르고 화살표로 움직입니다.
  await page.keyboard.press(tabKey(browserName));
  await expect(page.getByRole('button', { name: '제목', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: '굵게' })).toBeFocused();
  await page.keyboard.press(tabKey(browserName));
  await expect(editorOf(page)).toBeFocused();
  await page.keyboard.type('키보드로 쓴 리뷰');
  await page.keyboard.press(tabKey(browserName));
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
