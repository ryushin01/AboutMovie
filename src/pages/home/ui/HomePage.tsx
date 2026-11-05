import { css } from '@emotion/react';
import { Link } from 'react-router';
import { ReviewCard, useReviews } from '@/entities/review';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { buttonCss } from '@/shared/ui/Button';

const heroCss = css`
  padding-block: clamp(32px, 6vw, 96px) clamp(32px, 5vw, 72px);
`;
const wordmarkCss = css`
  margin: 0;
  /* 좌우 여백을 뺀 폭에 맞춥니다. 6.6은 글자 폭에 맞춘 값입니다. */
  font-size: calc((100vw - 2 * clamp(16px, 3vw, 48px)) / 6.6);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.05em;
  white-space: nowrap;
`;
const leadCss = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 32px;
  margin: clamp(20px, 3vw, 40px) 0 0;
  font-size: clamp(1.0625rem, 1.6vw, 1.5rem);
  word-break: keep-all;

  span:last-of-type {
    color: var(--accent);
    font-weight: 700;
  }
`;
const gridCss = css`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: clamp(40px, 5vw, 80px) clamp(16px, 2vw, 32px);
  margin: 0;
  padding: clamp(32px, 4vw, 56px) 0 0;
  list-style: none;
  border-top: 4px solid var(--ink);

  /* 큰 카드와 작은 카드를 번갈아 놓아 잡지처럼 보이게 합니다. */
  li {
    grid-column: span 3;
  }
  li:nth-of-type(5n + 1) {
    grid-column: span 6;
  }
  li:nth-of-type(5n + 2) {
    grid-column: span 3;
    margin-top: clamp(0px, 8vw, 140px);
  }

  @media (max-width: 800px) {
    li,
    li:nth-of-type(5n + 1),
    li:nth-of-type(5n + 2) {
      grid-column: span 6;
      margin-top: 0;
    }
    li:nth-of-type(5n + 1) {
      grid-column: span 12;
    }
  }
`;

export function HomePage() {
  useDocumentTitle();
  const { data: reviews, isPending, isError } = useReviews();

  return (
    <>
      <section css={heroCss}>
        <h1 css={wordmarkCss}>ABOUT MOVIE</h1>
        <p css={leadCss}>
          <span>포스터 한 장, 장면 하나, 그리고 영화가 남긴 생각.</span>
          {reviews && <span>리뷰 {reviews.length}편</span>}
        </p>
      </section>

      {isPending && <output css={{ display: 'block' }}>리뷰를 불러오는 중입니다.</output>}
      {isError && <p role="alert">리뷰를 불러오지 못했습니다. 새로고침해 주세요.</p>}
      {reviews?.length === 0 && (
        <section css={{ borderTop: '4px solid var(--ink)', marginTop: 16 }}>
          <p css={{ margin: '32px 0 20px', fontSize: '1.25rem' }}>아직 리뷰가 없습니다.</p>
          <Link to={routes.newReview} css={buttonCss()}>
            첫 리뷰 쓰기
          </Link>
        </section>
      )}
      {reviews && reviews.length > 0 && (
        <ul css={gridCss}>
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
