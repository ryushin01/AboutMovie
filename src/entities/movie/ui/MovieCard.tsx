import { css } from '@emotion/react';
import { useState } from 'react';
import { Link } from 'react-router';
import { routes } from '@/shared/config/routes';
import { formatDate, isReleased, type Movie } from '../model/types';

const cardCss = css`
  position: relative;
  margin: 0;

  @media (prefers-reduced-motion: no-preference) {
    &:hover img {
      transform: scale(1.05);
    }
  }
  &:hover a,
  &:focus-within a {
    color: var(--accent);
  }
`;
const frameCss = css`
  position: relative;
  overflow: hidden;
  aspect-ratio: 2 / 3;
  background: var(--surface);
  border-radius: 4px;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
`;
const badgeCss = css`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  padding: 2px 8px;
  color: #fff;
  background: rgb(0 0 0 / 0.82);
  border-radius: 2px;
  font-size: 0.75rem;
  font-weight: 700;
`;
const titleCss = css`
  display: -webkit-box;
  overflow: hidden;
  margin: 10px 0 2px;
  font-size: clamp(0.9375rem, 1.1vw, 1.0625rem);
  font-weight: 700;
  line-height: 1.3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  a {
    color: inherit;
    text-decoration: none;
  }
  /* 카드 전체를 누를 수 있게 합니다. */
  a::after {
    content: '';
    position: absolute;
    inset: 0;
  }
`;
const metaCss = css`
  margin: 0;
  color: var(--muted);
  font-size: 0.8125rem;
`;

export function MovieCard({ movie }: { movie: Movie }) {
  const [now] = useState(() => new Date());
  const released = isReleased(movie, now);
  return (
    <article css={cardCss}>
      <div css={frameCss}>
        {(!released || movie.firstImport) && (
          <span css={badgeCss}>{released ? '국내 첫 공개' : `${formatDate(movie.releasedOn)} 공개`}</span>
        )}
        <img src={movie.poster} alt={`${movie.title} 포스터`} loading="lazy" />
      </div>
      <h3 css={titleCss}>
        <Link to={routes.movie(movie.id)}>{movie.title}</Link>
      </h3>
      <p css={metaCss}>
        {movie.year} · {movie.country}
      </p>
    </article>
  );
}
