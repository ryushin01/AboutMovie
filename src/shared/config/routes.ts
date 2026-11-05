export const routes = {
  home: '/',
  newReview: '/reviews/new',
  review: (id: string) => `/reviews/${encodeURIComponent(id)}`,
  editReview: (id: string) => `/reviews/${encodeURIComponent(id)}/edit`,
};
