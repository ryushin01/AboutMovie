import { css } from '@emotion/react';
import { Link } from '@tanstack/react-router';
import { AGE_LABELS, formatRuntime, MoviePoster, type Movie } from '@/entities/movie';
import { routes } from '@/shared/config/routes';
import { buttonCss } from '@/shared/ui/Button';
import { visuallyHidden } from '@/shared/ui/styles';

export const HOME_TITLE = '시네필을 위한 영화 전문 OTT. 아직 수입되지 않은 영화를 가장 먼저 만나세요.';

const heroCss = css`
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: clamp(16px, 3vw, 48px);
  overflow: hidden;
  min-height: clamp(320px, 50vh, 540px);
  /* 본문 여백을 넘어 화면 폭 전체를 씁니다. */
  margin-inline: calc(-1 * var(--gutter));
  padding: clamp(20px, 3vw, 40px) var(--gutter);
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
  background: linear-gradient(90deg, rgb(0 0 0 / 0.86) 0%, rgb(0 0 0 / 0.7) 60%, rgb(0 0 0 / 0.5) 100%);
`;
const textCss = css`
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: 44rem;
`;
const brandCss = css`
  margin: 0 0 16px;
  font-size: clamp(1rem, 1.6vw, 1.25rem);
  font-weight: 800;
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
  margin: 0 0 8px;
  font-size: clamp(1.75rem, 4.5vw, 3.5rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.03em;
`;
const metaCss = css`
  margin: 0 0 12px;
`;
const synopsisCss = css`
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 20px;
  font-size: clamp(0.9375rem, 1.3vw, 1.125rem);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
`;
const linkCss = css`
  color: #111;
  background: #fff;
  border-color: #fff;

  &:hover:not(:disabled) {
    color: #fff;
    background: transparent;
  }
`;
const posterCss = css`
  position: relative;
  flex: none;
  width: clamp(120px, 15vw, 220px);
  aspect-ratio: 2 / 3;
  object-fit: cover;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.5);

  @media (max-width: 560px) {
    display: none;
  }
`;

/** 메인 맨 위. 서비스 소개(h1)와 가장 최근의 국내 첫 공개작을 함께 보여 줍니다. */
export function FeaturedMovie({ movie }: { movie: Movie }) {
  return (
    <section css={heroCss} aria-labelledby="featured-title">
      <img css={backdropCss} src={movie.backdrop} alt="" />
      <div css={shadeCss} />
      <div css={textCss}>
        <h1 css={brandCss}>{HOME_TITLE}</h1>
        {movie.firstImport && <p css={labelCss}>국내 첫 공개</p>}
        <h2 id="featured-title" css={titleCss}>
          {movie.title}
        </h2>
        <p css={metaCss}>
          {movie.year} · {movie.country} · {AGE_LABELS[movie.ageRating]} ·{' '}
          {formatRuntime(movie.runtimeMinutes)}
        </p>
        <p css={synopsisCss}>{movie.synopsis}</p>
        <Link {...routes.movie(movie.id)} css={[buttonCss(), linkCss]}>
          자세히 보기<span css={visuallyHidden}>: {movie.title}</span>
        </Link>
      </div>
      <MoviePoster css={posterCss} movie={movie} loading="eager" />
    </section>
  );
}
