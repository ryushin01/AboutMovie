import { defineConfig, devices } from '@playwright/test';

const PORT = 4310;
const STORYBOOK_PORT = 4311;

// 빌드 결과를 검사합니다. 먼저 `pnpm build`와 `pnpm build-storybook`이 필요합니다.
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: `http://localhost:${PORT}`, ...devices['Desktop Chrome'] },
  webServer: [
    {
      command: `pnpm exec vite preview --port ${PORT} --strictPort`,
      port: PORT,
      reuseExistingServer: false,
    },
    {
      command: `pnpm exec vite preview --outDir storybook-static --port ${STORYBOOK_PORT} --strictPort`,
      port: STORYBOOK_PORT,
      reuseExistingServer: false,
    },
  ],
});
