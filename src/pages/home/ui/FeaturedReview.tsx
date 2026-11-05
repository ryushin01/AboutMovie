import { css } from '@emotion/react';
import { Link } from 'react-router';
import { plainText, Rating, type Review } from '@/entities/review';
import { routes } from '@/shared/config/routes';
import { buttonCss } from '@/shared/ui/Button';

const heroCss = css`
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: clamp(16px, 3vw, 48px);
  overflow: hidden;
  min-height: clamp(280px, 44vh, 480px);
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
  filter: blur(36px) saturate(1.2);
  transform: scale(1.2);
  opacity: 0.7;
`;
const shadeCss = css`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgb(0 0 0 / 0.82) 0%, rgb(0 0 0 / 0.62) 60%, rgb(0 0 0 / 0.4) 100%);
`;
const textCss = css`
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: 44rem;
`;
const brandCss = css`
  margin: 0 0 12px;
  font-size: clamp(0.875rem, 1.2vw, 1rem);
  font-weight: 800;
  letter-spacing: 0.08em;
`;
const titleCss = css`
  margin: 0 0 8px;
  font-size: clamp(1.75rem, 4.5vw, 3.5rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.03em;
`;
const metaCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin: 0 0 12px;
`;
const excerptCss = css`
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 20px;
  font-size: clamp(0.9375rem, 1.3vw, 1.125rem);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
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
  object-fit: contain;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.5);

  @media (max-width: 560px) {
    display: none;
  }
`;

/** 홈 맨 위의 대표 리뷰. 사이트 제목(h1)과 가장 최근 글을 함께 보여 줍니다. */
export function FeaturedReview({ review }: { review: Review }) {
  return (
    <section css={heroCss} aria-labelledby="featured-title">
      <img css={backdropCss} src={review.poster} alt="" />
      <div css={shadeCss} />
      <div css={textCss}>
        <h1 css={brandCss}>ABOUT MOVIE · 평론가의 영화 리뷰</h1>
        <h2 id="featured-title" css={titleCss}>
          {review.title}
        </h2>
        <p css={metaCss}>
          <span>{review.year}</span>
          <span>{review.genre}</span>
          <Rating value={review.rating} />
        </p>
        <p css={excerptCss}>{plainText(review.body)}</p>
        <Link to={routes.review(review.id)} css={[buttonCss(), linkCss]}>
          리뷰 읽기<span css={{ position: 'absolute', clipPath: 'inset(50%)' }}>: {review.title}</span>
        </Link>
      </div>
      <img css={posterCss} src={review.poster} alt={`${review.title} 포스터`} />
    </section>
  );
}
