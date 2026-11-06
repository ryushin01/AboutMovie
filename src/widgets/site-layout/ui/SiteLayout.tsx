import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useSession } from '@/entities/session';
import { LogoutButton } from '@/features/logout';
import { MovieSearch } from '@/features/search-movies';
import { ThemeToggle } from '@/features/toggle-theme';
import { routes } from '@/shared/config/routes';
import { buttonCss } from '@/shared/ui/Button';

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
  padding: 16px var(--gutter);
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
const navLinkCss = css`
  ${buttonCss('outline')}
  padding-inline: 14px;

  /* 색만으로 구분하지 않도록 지금 화면은 밑줄도 긋습니다. */
  &[aria-current='page'] {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;
const mainCss = css`
  /* 내용이 늦게 그려져도 바닥글이 밀려 내려가지 않게 합니다. */
  min-height: 100svh;
  padding-inline: var(--gutter);
  padding-bottom: 96px;

  /* 키보드 사용자에게만 표시되며, 화면 가장자리에서 잘리지 않게 안쪽에 그립니다. */
  &:focus-visible {
    outline-offset: -3px;
  }
`;
const footerCss = css`
  padding: 24px var(--gutter);
  color: var(--muted);
  border-top: 1px solid var(--ink);
`;

export function SiteLayout() {
  const { user, isPending } = useSession();
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
        <MovieSearch />
        <nav aria-label="주요 메뉴" css={navCss}>
          <NavLink to={routes.movies()} css={navLinkCss}>
            영화
          </NavLink>
          <NavLink to={routes.plans} css={navLinkCss}>
            이용권
          </NavLink>
          {/* 확인이 끝나기 전에는 회원에게 로그인 메뉴가 깜빡이지 않도록 둘 다 숨깁니다. */}
          {isPending ? null : user ? (
            <>
              <NavLink to={routes.account} css={navLinkCss}>
                내 계정
              </NavLink>
              <LogoutButton />
            </>
          ) : (
            <>
              <NavLink to={routes.login()} css={navLinkCss}>
                로그인
              </NavLink>
              <NavLink to={routes.signup()} css={navLinkCss}>
                회원가입
              </NavLink>
            </>
          )}
          <ThemeToggle />
        </nav>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1} css={mainCss}>
        <Outlet />
      </main>
      <footer css={footerCss}>
        <small>
          AboutMovie · 포트폴리오 프로젝트입니다. 영화와 인물은 모두 가상이고, 결제는 실제로 이루어지지
          않으며, 영상도 재생되지 않습니다.
        </small>
      </footer>
    </>
  );
}
