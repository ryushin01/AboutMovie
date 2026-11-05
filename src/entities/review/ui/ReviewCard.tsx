import { css } from '@emotion/react';
import { Link } from 'react-router';
import { routes } from '@/shared/config/routes';
import type { Review } from '../model/types';
import { Rating } from './Rating';

const cardCss = css`
  position: relative;
  margin: 0;

  &:hover img {
    transform: scale(1.04);
  }
  &:hover a,
  &:focus-within a {
    color: var(--accent);
  }
`;
const frameCss = css`
  overflow: hidden;
  aspect-ratio: 2 / 3;
  background: var(--surface);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
`;
const titleCss = css`
  margin: 16px 0 8px;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  word-break: keep-all;
  overflow-wrap: anywhere;

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
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 0;
  color: var(--muted);
`;

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article css={cardCss}>
      <div css={frameCss}>
        <img src={review.poster} alt={`${review.title} 포스터`} />
      </div>
      <h2 css={titleCss}>
        <Link to={routes.review(review.id)}>{review.title}</Link>
      </h2>
      <p css={metaCss}>
        <span>{review.year}</span>
        <Rating value={review.rating} />
      </p>
    </article>
  );
}
