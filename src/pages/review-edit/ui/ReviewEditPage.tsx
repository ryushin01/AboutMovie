import { Link, useNavigate, useParams } from 'react-router';
import { useReview } from '@/entities/review';
import { ReviewForm } from '@/features/review-form';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { buttonCss } from '@/shared/ui/Button';
import { PageMessage } from '@/shared/ui/PageMessage';
import { formTitleCss } from '@/shared/ui/styles';

export function ReviewEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: review, isPending, isError } = useReview(id);
  useDocumentTitle(review ? `${review.title} 수정` : review === null ? '리뷰를 찾을 수 없습니다' : undefined);

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
    <>
      <h1 css={formTitleCss}>리뷰 수정</h1>
      <ReviewForm
        key={review.id}
        review={review}
        cancelTo={routes.review(review.id)}
        onSaved={(savedId) => navigate(routes.review(savedId))}
      />
    </>
  );
}
