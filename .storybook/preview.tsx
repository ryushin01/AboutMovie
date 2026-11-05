import { QueryClientProvider } from '@tanstack/react-query';
import type { Preview } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router';
import { GlobalStyles } from '../src/app/styles/GlobalStyles';
import { createQueryClient } from '../src/shared/api/queryClient';

const queryClient = createQueryClient();

const preview: Preview = {
  globalTypes: {
    theme: {
      description: '테마',
      toolbar: { title: '테마', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, { globals, parameters }) => {
      document.documentElement.dataset.theme = globals.theme;
      // 페이지 스토리는 parameters.route로 경로를 지정합니다.
      const { path = '*', entry = '/' } = parameters.route ?? {};
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter key={entry} initialEntries={[entry]}>
            <GlobalStyles />
            <Routes>
              <Route path={path} element={<Story />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );
    },
  ],
};
export default preview;
