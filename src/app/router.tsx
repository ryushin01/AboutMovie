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
      children: [
        {
          element: <SiteLayout />,
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
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
