import { fileURLToPath } from 'node:url';
import netlify from '@netlify/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react({ jsxImportSource: '@emotion/react' }),
    // 로컬 개발에서 함수·DB·이미지 저장소를 흉내 냅니다. 테스트는 API를 직접 가짜로 대신합니다.
    ...(process.env.VITEST || process.env.E2E ? [] : [netlify()]),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/shared/lib/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'netlify/**/*.test.ts'],
  },
});
