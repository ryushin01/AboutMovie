import { useEffect } from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { NotFoundPage } from '@/pages/not-found';
import { ReviewDetailPage } from '@/pages/review-detail';
import { ReviewEditPage } from '@/pages/review-edit';
import { ReviewNewPage } from '@/pages/review-new';
import { SiteLayout } from '@/widgets/site-layout';

function Root() {
  const { hash } = useLocation();
  const navigate = useNavigate();

  // 초대·비밀번호 재설정 메일의 링크는 사이트 첫 화면으로 들어옵니다. 토큰을 처리할 로그인 화면으로 넘깁니다.
  useEffect(() => {
    if (/(invite|recovery|confirmation|access)_token=/.test(hash))
      navigate(`/login${hash}`, { replace: true });
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
            { path: '/login', element: <LoginPage /> },
            { path: '/reviews/new', element: <ReviewNewPage /> },
            { path: '/reviews/:id', element: <ReviewDetailPage /> },
            { path: '/reviews/:id/edit', element: <ReviewEditPage /> },
            { path: '*', element: <NotFoundPage /> },
          ],
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
