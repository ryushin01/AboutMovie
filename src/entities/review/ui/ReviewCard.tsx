import { css } from '@emotion/react';
import { Link } from 'react-router';
import { routes } from '@/shared/config/routes';
import type { Review } from '../model/types';
import { Rating } from './Rating';

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
  overflow: hidden;
  aspect-ratio: 2 / 3;
  background: var(--surface);
  border-radius: 4px;

  img {
    display: block;
    width: 100%;
    height: 100%;
    /* 2:3 틀은 유지하되, 비율이 다른 포스터도 잘리지 않게 보여 줍니다. */
    object-fit: contain;
    transition: transform 0.3s ease;
  }
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
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0 8px;
  margin: 0;
  color: var(--muted);
  font-size: 0.8125rem;
`;

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article css={cardCss}>
      <div css={frameCss}>
        <img src={review.poster} alt={`${review.title} 포스터`} loading="lazy" />
      </div>
      <h3 css={titleCss}>
        <Link to={routes.review(review.id)}>{review.title}</Link>
      </h3>
      <p css={metaCss}>
        <span>{review.year}</span>
        <Rating value={review.rating} />
      </p>
    </article>
  );
}
