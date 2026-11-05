import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSession } from './useSession';

function renderSession(respond: () => Promise<Response>) {
  const fetchMock = vi.fn(respond);
  vi.stubGlobal('fetch', fetchMock);
  const client = new QueryClient({ defaultOptions: { queries: { retry: 1, retryDelay: 0 } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { fetchMock, client, ...renderHook(() => useSession(), { wrapper }) };
}

const status = (client: QueryClient) => client.getQueryState(['session'])?.status;

afterEach(() => vi.unstubAllGlobals());

describe('useSession', () => {
  it('운영자 응답을 그대로 쓴다', async () => {
    const { result } = renderSession(async () => Response.json({ isCritic: true }));
    await waitFor(() => expect(result.current.isCritic).toBe(true));
  });

  it('4xx 응답은 다시 시도하지 않고 권한 없음으로 저장한다', async () => {
    const { result, client, fetchMock } = renderSession(async () => new Response('{}', { status: 401 }));
    await waitFor(() => expect(status(client)).toBe('success'));
    expect(result.current.isCritic).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['5xx 응답', async () => new Response('{}', { status: 503 })],
    [
      '네트워크 오류',
      async () => {
        throw new TypeError('Failed to fetch');
      },
    ],
  ])('%s는 다시 시도하고 권한 없음으로 저장하지 않는다', async (_name, respond) => {
    const { result, client, fetchMock } = renderSession(respond);
    await waitFor(() => expect(status(client)).toBe('error'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(client.getQueryData(['session'])).toBeUndefined();
    expect(result.current.isCritic).toBe(false);
  });
});
