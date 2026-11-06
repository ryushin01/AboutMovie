const withQuery = (path: string, query: Record<string, string>) => {
  const search = new URLSearchParams(query).toString();
  return search ? `${path}?${search}` : path;
};

export const routes = {
  home: '/',
  movies: (query: Record<string, string> = {}) => withQuery('/movies', query),
  movie: (id: string) => `/movies/${encodeURIComponent(id)}`,
  watch: (id: string) => `/watch/${encodeURIComponent(id)}`,
  plans: '/plans',
  checkout: (plan: string) => `/checkout/${encodeURIComponent(plan)}`,
  account: '/account',
  login: (next?: string) => withQuery('/login', next ? { next } : {}),
  signup: (next?: string) => withQuery('/signup', next ? { next } : {}),
};

/** 로그인 뒤 돌아갈 주소는 이 사이트 안의 경로만 받습니다. */
export const safeNext = (next: string | null) =>
  next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : routes.home;
