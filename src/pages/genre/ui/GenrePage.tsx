import { css } from '@emotion/react';
import { Link, useParams } from 'react-router';
import { GENRES, GenreTags, ReviewCard, useReviews, type Genre } from '@/entities/review';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { buttonCss } from '@/shared/ui/Button';
import { PageMessage } from '@/shared/ui/PageMessage';
import { formTitleCss } from '@/shared/ui/styles';

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

const isGenre = (value: string): value is Genre => (GENRES as readonly string[]).includes(value);

export function GenrePage() {
  const { genre = '' } = useParams();
  const known = isGenre(genre);
  useDocumentTitle(known ? `${genre} 리뷰` : '장르를 찾을 수 없습니다');
  const { data: reviews, isPending, isError } = useReviews();

  if (!known) {
    return (
      <PageMessage title="장르를 찾을 수 없습니다">
        <Link to={routes.home} css={buttonCss()}>
          목록으로
        </Link>
      </PageMessage>
    );
  }

  const matched = reviews?.filter((review) => review.genres.includes(genre)) ?? [];

  return (
    <section>
      <h1 css={formTitleCss}>{genre} 리뷰</h1>
      <nav aria-label="장르별 리뷰">
        <GenreTags genres={GENRES} current={genre} />
      </nav>
      {isPending && <output css={{ display: 'block', marginTop: 32 }}>리뷰를 불러오는 중입니다.</output>}
      {isError && (
        <p role="alert" css={{ marginTop: 32 }}>
          리뷰를 불러오지 못했습니다. 새로고침해 주세요.
        </p>
      )}
      {reviews && (
        <>
          <h2 css={countCss}>리뷰 {matched.length}편</h2>
          {matched.length === 0 ? (
            <p>이 장르의 리뷰는 아직 없습니다.</p>
          ) : (
            <ul css={gridCss}>
              {matched.map((review) => (
                <li key={review.id}>
                  <ReviewCard review={review} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
