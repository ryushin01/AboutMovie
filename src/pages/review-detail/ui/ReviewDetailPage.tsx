import { css } from '@emotion/react';
import { Link, useNavigate, useParams } from 'react-router';
import { GenreTags, Rating, RichText, useReview } from '@/entities/review';
import { useSession } from '@/entities/session';
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
  margin: 0 0 16px;
  color: var(--muted);
`;
const tagsCss = css`
  margin-bottom: 32px;
`;
const actionsCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

export function ReviewDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: review, isPending, isError } = useReview(id);
  const { isCritic } = useSession();
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
          <GenreTags genres={review.genres} css={tagsCss} />
          <RichText doc={review.body} />
          {isCritic && (
            <div css={actionsCss}>
              <Link to={routes.editReview(review.id)} css={buttonCss()}>
                수정
              </Link>
              <DeleteReviewButton
                id={review.id}
                title={review.title}
                onDeleted={() => navigate(routes.home)}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
