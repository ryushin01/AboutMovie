import { QueryClientProvider } from '@tanstack/react-query';
import type { Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
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
    (Story, { globals }) => {
      document.documentElement.dataset.theme = globals.theme;
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <GlobalStyles />
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      );
    },
  ],
};
export default preview;
