import { Link } from 'react-router';
import { GENRES, GenreTags, useReviews } from '@/entities/review';
import { useSession } from '@/entities/session';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { buttonCss } from '@/shared/ui/Button';
import { formTitleCss } from '@/shared/ui/styles';
import { ReviewRow } from '@/widgets/review-row';
import { buildRows } from '../lib/buildRows';
import { FeaturedReview } from './FeaturedReview';

export function HomePage() {
  useDocumentTitle();
  const { data: reviews, isPending, isError } = useReviews();
  const { isCritic } = useSession();

  if (isPending) return <output css={{ display: 'block', paddingTop: 32 }}>리뷰를 불러오는 중입니다.</output>;
  if (isError) {
    return (
      <p role="alert" css={{ paddingTop: 32 }}>
        리뷰를 불러오지 못했습니다. 새로고침해 주세요.
      </p>
    );
  }
  if (reviews.length === 0) {
    return (
      <section>
        <h1 css={formTitleCss}>ABOUT MOVIE</h1>
        <p css={{ margin: '0 0 20px', fontSize: '1.25rem' }}>아직 공개된 리뷰가 없습니다.</p>
        {isCritic && (
          <Link to={routes.newReview} css={buttonCss()}>
            첫 리뷰 쓰기
          </Link>
        )}
      </section>
    );
  }

  return (
    <>
      <FeaturedReview review={reviews[0]} />
      <nav aria-label="장르별 리뷰" css={{ marginTop: 24 }}>
        <GenreTags
          genres={GENRES.filter((genre) => reviews.some((review) => review.genres.includes(genre)))}
        />
      </nav>
      {buildRows(reviews).map((row) => (
        <ReviewRow key={row.title} title={row.title} reviews={row.reviews} />
      ))}
    </>
  );
}
