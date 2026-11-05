import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4310);

// 프로덕션 빌드를 검사합니다. 먼저 `pnpm build`가 필요합니다.
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
  ],
  webServer: {
    command: `pnpm exec vite preview --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: false,
  },
});
