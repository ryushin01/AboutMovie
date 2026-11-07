import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createQueryClient } from '@/shared/api/queryClient';

export function renderWithProviders(ui: ReactElement, initialPath = '/') {
  // useBlocker를 쓰는 컴포넌트가 있어 앱과 같은 데이터 라우터로 렌더링합니다.
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [initialPath] });
  const queryClient = createQueryClient();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...result, queryClient };
}
