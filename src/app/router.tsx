import { createBrowserRouter, Outlet, ScrollRestoration } from 'react-router';
import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';
import { ReviewDetailPage } from '@/pages/review-detail';
import { ReviewEditPage } from '@/pages/review-edit';
import { ReviewNewPage } from '@/pages/review-new';
import { SiteLayout } from '@/widgets/site-layout';

function Root() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <SiteLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/reviews/new', element: <ReviewNewPage /> },
          { path: '/reviews/:id', element: <ReviewDetailPage /> },
          { path: '/reviews/:id/edit', element: <ReviewEditPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
