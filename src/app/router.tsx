import { useEffect } from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router';
import { AccountPage } from '@/pages/account';
import { CheckoutPage } from '@/pages/checkout';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { MovieDetailPage } from '@/pages/movie-detail';
import { MovieListPage } from '@/pages/movie-list';
import { NotFoundPage } from '@/pages/not-found';
import { PlansPage } from '@/pages/plans';
import { RouteErrorPage } from '@/pages/route-error';
import { SignupPage } from '@/pages/signup';
import { WatchPage } from '@/pages/watch';
import { SiteLayout } from '@/widgets/site-layout';

function Root() {
  const { hash } = useLocation();
  const navigate = useNavigate();

  // 가입 확인·비밀번호 재설정 메일의 링크는 사이트 첫 화면으로 들어옵니다. 토큰을 처리할 로그인 화면으로 넘깁니다.
  useEffect(() => {
    if (/(recovery|confirmation|access)_token=/.test(hash)) navigate(`/login${hash}`, { replace: true });
  }, [hash, navigate]);

  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter(
  [
    {
      element: <Root />,
      // 머리글까지 그리지 못한 경우의 마지막 안내입니다.
      errorElement: (
        <main>
          <RouteErrorPage />
        </main>
      ),
      children: [
        {
          element: <SiteLayout />,
          children: [
            {
              // 화면을 그리다 오류가 나도 머리글이 남아 다른 화면으로 갈 수 있습니다.
              errorElement: <RouteErrorPage />,
              children: [
                { path: '/', element: <HomePage /> },
                { path: '/movies', element: <MovieListPage /> },
                { path: '/movies/:id', element: <MovieDetailPage /> },
                { path: '/watch/:id', element: <WatchPage /> },
                { path: '/plans', element: <PlansPage /> },
                { path: '/checkout/:plan', element: <CheckoutPage /> },
                { path: '/account', element: <AccountPage /> },
                { path: '/login', element: <LoginPage /> },
                { path: '/signup', element: <SignupPage /> },
                { path: '*', element: <NotFoundPage /> },
              ],
            },
          ],
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
