import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const base = 'http://localhost:4311';

for (const theme of ['light', 'dark']) {
  test(`모든 스토리가 렌더링되고 접근성 위반이 없다 (${theme})`, async ({ page }) => {
    test.setTimeout(120_000);
    const index = await (await page.request.get(`${base}/index.json`)).json();
    const ids = Object.keys(index.entries);
    expect(ids.length).toBeGreaterThan(0);

    const failures: string[] = [];
    for (const id of ids) {
      await page.goto(`${base}/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`);
      await page.locator('#storybook-root > *').first().waitFor();
      await page.waitForFunction(() => !document.querySelector('[role="status"]:not(:empty)'));
      if (await page.locator('body.sb-show-errordisplay').count()) failures.push(`${id}: 렌더링 오류`);

      const { violations } = await new AxeBuilder({ page })
        .include('#storybook-root')
        // 컴포넌트 단독 화면이라 페이지 전체 구조 규칙은 제외합니다.
        .disableRules(['region', 'landmark-one-main', 'page-has-heading-one'])
        .analyze();
      failures.push(...violations.map((v) => `${id}: ${v.id}`));
    }
    expect(failures).toEqual([]);
  });
}
