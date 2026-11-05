import type { Preview } from '@storybook/react-vite';
import { QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { GlobalStyles } from '../src/app/styles/GlobalStyles';
import { createQueryClient } from '../src/shared/api/queryClient';

const queryClient = createQueryClient();

// 라우터를 다시 만들지 않고도 스토리의 args 변경이 화면에 반영되게 합니다.
const StoryContext = createContext<ReactNode>(null);
const StorySlot = () => <>{useContext(StoryContext)}</>;

function StoryRouter({ path, entry, children }: { path: string; entry: string; children: ReactNode }) {
  const router = useMemo(
    () => createMemoryRouter([{ path, element: <StorySlot /> }], { initialEntries: [entry] }),
    [path, entry],
  );
  return (
    <StoryContext.Provider value={children}>
      <RouterProvider router={router} />
    </StoryContext.Provider>
  );
}

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
          <GlobalStyles />
          <StoryRouter path={path} entry={entry}>
            <Story />
          </StoryRouter>
        </QueryClientProvider>
      );
    },
  ],
};
export default preview;
