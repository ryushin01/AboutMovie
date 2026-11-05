import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { ThemeToggle } from '@/features/toggle-theme';
import { routes } from '@/shared/config/routes';
import { buttonCss } from '@/shared/ui/Button';

const gutter = 'clamp(16px, 3vw, 48px)';

const skipCss = css`
  position: absolute;
  top: -100px;
  left: 16px;
  z-index: 10;
  padding: 12px 16px;
  color: var(--bg);
  background: var(--ink);

  &:focus {
    top: 16px;
  }
`;
const headerCss = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px ${gutter};
  border-bottom: 1px solid var(--ink);
`;
const logoCss = css`
  color: inherit;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
`;
const navCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
const mainCss = css`
  padding-inline: ${gutter};
  padding-bottom: 96px;

  &:focus {
    outline: none;
  }
`;
const footerCss = css`
  padding: 24px ${gutter};
  color: var(--muted);
  border-top: 1px solid var(--ink);
`;

export function SiteLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);

  // 화면이 바뀌면 스크린 리더와 키보드 사용자가 새 본문에서 시작하도록 합니다.
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <a href="#main" css={skipCss}>
        본문 바로가기
      </a>
      <header css={headerCss}>
        <Link to={routes.home} css={logoCss}>
          AboutMovie
        </Link>
        <nav aria-label="주요 메뉴" css={navCss}>
          <Link to={routes.newReview} css={buttonCss()}>
            리뷰 쓰기
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1} css={mainCss}>
        <Outlet />
      </main>
      <footer css={footerCss}>
        <small>AboutMovie · 리뷰는 이 브라우저에 저장됩니다.</small>
      </footer>
    </>
  );
}
