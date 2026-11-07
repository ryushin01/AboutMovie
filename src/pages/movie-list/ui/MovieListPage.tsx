import { css } from '@emotion/react';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { MovieCard, MovieCardSkeleton, toMovieSearch, useMovies } from '@/entities/movie';
import { MovieFilterForm } from '@/features/filter-movies';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { buttonCss } from '@/shared/ui/Button';
import { visuallyHidden } from '@/shared/ui/styles';

const SKELETON_CARDS = 12;
const route = getRouteApi('/movies');

const titleCss = css`
  margin: 0;
  padding-block: clamp(24px, 4vw, 56px) clamp(16px, 2vw, 32px);
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.03em;
`;
const countCss = css`
  margin: 32px 0 16px;
  font-size: clamp(1.125rem, 1.8vw, 1.5rem);
  font-weight: 800;
`;
const gridCss = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(140px, 40vw), 1fr));
  gap: clamp(16px, 2vw, 28px) clamp(8px, 1vw, 16px);
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    min-width: 0;
  }
`;
const pagesCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 32px 0 0;
  padding: 0;
  list-style: none;

  a {
    min-width: 48px;
    padding-inline: 12px;
  }
  /* 색만으로 구분하지 않도록 밑줄도 긋습니다. */
  a[aria-current='page'] {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

/** 3단 구조의 두 번째 단계. 검색과 필터 상태는 주소에 있어 공유와 뒤로 가기가 그대로 동작합니다. */
export function MovieListPage() {
  useDocumentTitle('영화 찾기');
  // 주소의 검색 조건은 라우터가 검증해서 넘깁니다.
  const filters = route.useSearch();
  const navigate = useNavigate();
  const { data, isPending, isError } = useMovies(filters, { keepPrevious: true });
  const pageCount = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <>
      <h1 css={titleCss}>영화 찾기</h1>
      <MovieFilterForm
        filters={filters}
        onApply={(query) =>
          navigate({ to: '/movies', search: Object.fromEntries(new URLSearchParams(query)) })
        }
      />
      {isPending && (
        <>
          <output css={visuallyHidden}>영화를 불러오는 중입니다.</output>
          <ul aria-hidden="true" css={[gridCss, { marginTop: 32 }]}>
            {Array.from({ length: SKELETON_CARDS }, (_, index) => (
              <li key={index}>
                <MovieCardSkeleton />
              </li>
            ))}
          </ul>
        </>
      )}
      {isError && (
        <p role="alert" css={{ marginTop: 32 }}>
          영화를 불러오지 못했습니다. 새로고침해 주세요.
        </p>
      )}
      {data && (
        <>
          {/* 조건을 바꾸면 스크린 리더에도 결과 수가 읽힙니다. */}
          <h2 css={countCss}>
            <output>영화 {data.total}편</output>
          </h2>
          {data.total === 0 ? (
            <>
              <p>조건에 맞는 영화가 없습니다. 조건을 줄여 보세요.</p>
              <Link {...routes.movies()} css={buttonCss()}>
                전체 영화 보기
              </Link>
            </>
          ) : (
            <ul css={gridCss}>
              {data.items.map((movie) => (
                <li key={movie.id}>
                  <MovieCard movie={movie} />
                </li>
              ))}
            </ul>
          )}
          {pageCount > 1 && (
            <nav aria-label="페이지">
              <ul css={pagesCss}>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                  <li key={page}>
                    <Link
                      {...routes.movies(toMovieSearch({ ...filters, page }))}
                      css={buttonCss('outline')}
                      aria-current={page === data.page ? 'page' : undefined}
                    >
                      {page}
                      <span css={visuallyHidden}>페이지</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      )}
    </>
  );
}
