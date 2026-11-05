import { css } from '@emotion/react';
import { Link, useNavigate, useParams } from 'react-router';
import { Rating, useReview } from '@/entities/review';
import { DeleteReviewButton } from '@/features/delete-review';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { buttonCss } from '@/shared/ui/Button';
import { PageMessage } from '@/shared/ui/PageMessage';

const titleCss = css`
  margin: 0;
  padding-block: clamp(32px, 6vw, 96px) clamp(24px, 4vw, 56px);
  font-size: clamp(2.75rem, 9vw, 10rem);
  font-weight: 900;
  line-height: 0.98;
  letter-spacing: -0.04em;
  word-break: keep-all;
  overflow-wrap: anywhere;
`;
const contentCss = css`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: clamp(24px, 4vw, 64px);
  padding-top: clamp(24px, 3vw, 40px);
  border-top: 4px solid var(--ink);

  @media (max-width: 800px) {
    display: block;
  }
`;
const posterCss = css`
  grid-column: span 4;

  img {
    display: block;
    width: 100%;
    /* 불러오는 동안 화면이 밀리지 않도록 틀을 유지하고, 비율이 달라도 자르지 않습니다. */
    aspect-ratio: 2 / 3;
    object-fit: contain;
    background: var(--surface);
  }
  @media (max-width: 800px) {
    max-width: 320px;
    margin-bottom: 32px;
  }
`;
const articleCss = css`
  grid-column: span 8;
  min-width: 0;
`;
const metaCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin: 0 0 32px;
  color: var(--muted);
`;
const bodyCss = css`
  max-width: 44rem;
  margin: 0 0 40px;
  font-size: clamp(1.125rem, 1.6vw, 1.375rem);
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;
const actionsCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;
const sectionTitleCss = css`
  margin: clamp(56px, 8vw, 120px) 0 24px;
  font-size: clamp(1.75rem, 4vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
`;
const galleryCss = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(8px, 1.5vw, 24px);
  margin: 0;
  padding: 0;
  list-style: none;

  /* 첫 장면은 크게, 짝이 없는 마지막 장면도 빈칸이 남지 않게 넓게 놓습니다. */
  li:first-of-type,
  li:last-of-type:nth-of-type(even) {
    grid-column: 1 / -1;
  }
  img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    /* 비율이 다른 장면도 잘리지 않게 보여 줍니다. */
    object-fit: contain;
    background: var(--surface);
  }
`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

export function ReviewDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: review, isPending, isError } = useReview(id);
  useDocumentTitle(review?.title ?? (review === null ? '리뷰를 찾을 수 없습니다' : undefined));

  if (isPending) return <output css={{ display: 'block' }}>리뷰를 불러오는 중입니다.</output>;
  if (isError) return <p role="alert">리뷰를 불러오지 못했습니다. 새로고침해 주세요.</p>;
  if (!review) {
    return (
      <PageMessage title="리뷰를 찾을 수 없습니다">
        <Link to={routes.home} css={buttonCss()}>
          목록으로
        </Link>
      </PageMessage>
    );
  }

  return (
    <article>
      <h1 css={titleCss}>{review.title}</h1>
      <div css={contentCss}>
        <div css={posterCss}>
          <img src={review.poster} alt={`${review.title} 포스터`} />
        </div>
        <div css={articleCss}>
          <p css={metaCss}>
            <span>{review.year}년 개봉</span>
            <Rating value={review.rating} />
            <time dateTime={review.createdAt}>{formatDate(review.createdAt)} 작성</time>
          </p>
          <p css={bodyCss}>{review.body}</p>
          <div css={actionsCss}>
            <Link to={routes.editReview(review.id)} css={buttonCss()}>
              수정
            </Link>
            <DeleteReviewButton id={review.id} title={review.title} onDeleted={() => navigate(routes.home)} />
          </div>
        </div>
      </div>

      {review.scenes.length > 0 && (
        <section aria-labelledby="scenes-title">
          <h2 id="scenes-title" css={sectionTitleCss}>
            영화 속 장면
          </h2>
          <ul css={galleryCss}>
            {review.scenes.map((scene) => (
              <li key={scene.id}>
                <img src={scene.src} alt={scene.description} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
