export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`API 요청 실패: ${status}`);
  }
}

/** JSON API를 호출합니다. 2xx가 아니면 ApiError를 던지고, 내용이 없는 응답은 undefined를 돌려줍니다. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) throw new ApiError(response.status);
  return (response.status === 204 ? undefined : await response.json()) as T;
}
