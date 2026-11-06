import { css } from '@emotion/react';
import { Link, useParams } from 'react-router';
import {
  AGE_LABELS,
  formatDate,
  formatRuntime,
  GenreLinks,
  MoviePoster,
  useMovie,
  type Movie,
} from '@/entities/movie';
import { WatchlistButton } from '@/features/toggle-watchlist';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { buttonCss } from '@/shared/ui/Button';
import { PageMessage } from '@/shared/ui/PageMessage';
import { skeletonCss, visuallyHidden } from '@/shared/ui/styles';
import { RelatedMovies } from './RelatedMovies';
import { WatchAction } from './WatchAction';

const heroCss = css`
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: clamp(16px, 3vw, 48px);
  overflow: hidden;
  margin-inline: calc(-1 * var(--gutter));
  padding: clamp(32px, 6vw, 80px) var(--gutter) clamp(20px, 3vw, 40px);
  color: #fff;
  background: #111;
`;
const backdropCss = css`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const shadeCss = css`
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 0.72);
`;
const posterCss = css`
  position: relative;
  flex: none;
  width: clamp(120px, 18vw, 260px);
  aspect-ratio: 2 / 3;
  object-fit: cover;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.5);

  @media (max-width: 560px) {
    display: none;
  }
`;
const textCss = css`
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: 48rem;
`;
const labelCss = css`
  display: inline-block;
  margin: 0 0 8px;
  padding: 2px 8px;
  border: 1px solid #fff;
  font-size: 0.8125rem;
  font-weight: 700;
`;
const titleCss = css`
  margin: 0;
  font-size: clamp(2rem, 6vw, 4.5rem);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.03em;
`;
const originalCss = css`
  margin: 8px 0 12px;
  font-size: clamp(1rem, 1.6vw, 1.25rem);
`;
const metaCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin: 0 0 16px;
  padding: 0;
  list-style: none;
`;
const synopsisCss = css`
  margin: 16px 0 24px;
  font-size: clamp(1rem, 1.4vw, 1.1875rem);
`;
const loadingLineCss = css`
  height: 1em;
  margin-top: 16px;
  border-radius: 2px;
`;
const actionsCss = css`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
`;
const sectionCss = css`
  max-width: 60rem;
  margin-top: clamp(32px, 4vw, 56px);

  h2 {
    margin: 0 0 16px;
    font-size: clamp(1.25rem, 2vw, 1.75rem);
    font-weight: 800;
  }
`;
const infoCss = css`
  display: grid;
  grid-template-columns: minmax(88px, 140px) 1fr;
  gap: 8px 16px;
  margin: 0;

  dt {
    color: var(--muted);
    font-weight: 700;
  }
  dd {
    margin: 0;
  }
  /* 터치 목표를 키우되 글 흐름을 유지합니다. */
  a {
    display: inline-block;
    min-height: 28px;
    color: inherit;
  }
`;
const peopleCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 0 12px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const joined = (items: string[]) => (items.length ? items.join(', ') : '없음');

function MovieInfo({ movie }: { movie: Movie }) {
  return (
    <section css={sectionCss} aria-labelledby="info-title">
      <h2 id="info-title">작품 정보</h2>
      <dl css={infoCss}>
        <dt>감독</dt>
        <dd>
          <Link to={routes.movies({ director: movie.director })}>{movie.director}</Link>
        </dd>
        <dt>각본</dt>
        <dd>{movie.writer}</dd>
        <dt>출연</dt>
        <dd>
          <ul css={peopleCss}>
            {movie.cast.map((actor) => (
              <li key={actor}>
                <Link to={routes.movies({ actor })}>{actor}</Link>
              </li>
            ))}
          </ul>
        </dd>
        <dt>제작</dt>
        <dd>
          <Link to={routes.movies({ year: String(movie.year) })}>{movie.year}년</Link>,{' '}
          <Link to={routes.movies({ country: movie.country })}>{movie.country}</Link>
        </dd>
        <dt>러닝타임</dt>
        <dd>
          {formatRuntime(movie.runtimeMinutes)} ({movie.runtimeMinutes}분)
        </dd>
        <dt>관람 등급</dt>
        <dd>{AGE_LABELS[movie.ageRating]}</dd>
        <dt>등급 사유</dt>
        <dd>{joined(movie.advisories)}</dd>
        <dt>음성</dt>
        <dd>{joined(movie.audioLanguages)}</dd>
        <dt>자막</dt>
        <dd>{joined(movie.subtitleLanguages)}</dd>
        <dt>분위기</dt>
        <dd>{joined(movie.moods)}</dd>
        <dt>서비스 공개일</dt>
        <dd>{formatDate(movie.releasedOn)}</dd>
      </dl>
    </section>
  );
}

/** 3단 구조의 마지막 단계 */
export function MovieDetailPage() {
  const { id = '' } = useParams();
  const { data: movie, isPending, isError } = useMovie(id);
  useDocumentTitle(movie?.title ?? (isPending ? undefined : '영화를 찾을 수 없습니다'));

  if (isPending) {
    return (
      <>
        <output css={visuallyHidden}>영화를 불러오는 중입니다.</output>
        <div aria-hidden="true" css={heroCss} data-skeleton="detail">
          <div css={[posterCss, skeletonCss]} />
          <div css={textCss}>
            <div css={[skeletonCss, loadingLineCss, { width: '60%', height: '3rem' }]} />
            <div css={[skeletonCss, loadingLineCss, { width: '40%' }]} />
            <div css={[skeletonCss, loadingLineCss]} />
            <div css={[skeletonCss, loadingLineCss, { width: '85%' }]} />
          </div>
        </div>
      </>
    );
  }
  if (isError) {
    return (
      <p role="alert" css={{ paddingTop: 32 }}>
        영화를 불러오지 못했습니다. 새로고침해 주세요.
      </p>
    );
  }
  if (!movie) {
    return (
      <PageMessage title="영화를 찾을 수 없습니다">
        <Link to={routes.movies()} css={buttonCss()}>
          영화 찾기로
        </Link>
      </PageMessage>
    );
  }

  return (
    <article>
      <div css={heroCss}>
        <img css={backdropCss} src={movie.backdrop} alt="" />
        <div css={shadeCss} />
        <MoviePoster css={posterCss} movie={movie} loading="eager" />
        <div css={textCss}>
          {movie.firstImport && <p css={labelCss}>국내 첫 공개</p>}
          <h1 css={titleCss}>{movie.title}</h1>
          <p css={originalCss} lang="und">
            {movie.originalTitle}
          </p>
          <ul css={metaCss}>
            <li>{movie.year}</li>
            <li>{AGE_LABELS[movie.ageRating]}</li>
            <li>{formatRuntime(movie.runtimeMinutes)}</li>
            <li>{movie.country}</li>
          </ul>
          <GenreLinks genres={movie.genres} />
          <p css={synopsisCss}>{movie.synopsis}</p>
          <div css={actionsCss}>
            <WatchAction movie={movie} />
            <WatchlistButton movieId={movie.id} />
          </div>
        </div>
      </div>
      <MovieInfo movie={movie} />
      <section css={sectionCss} aria-labelledby="import-title">
        <h2 id="import-title">수입 이야기</h2>
        <p css={{ margin: 0 }}>{movie.importNote}</p>
      </section>
      <RelatedMovies movie={movie} />
    </article>
  );
}
