export const routes = {
  home: '/',
  login: '/login',
  newReview: '/reviews/new',
  genre: (genre: string) => `/genres/${encodeURIComponent(genre)}`,
  review: (id: string) => `/reviews/${encodeURIComponent(id)}`,
  editReview: (id: string) => `/reviews/${encodeURIComponent(id)}/edit`,
};
