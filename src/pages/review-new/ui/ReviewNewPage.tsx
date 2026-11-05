import { useNavigate } from 'react-router';
import { RequireCritic } from '@/entities/session';
import { ReviewForm } from '@/features/review-form';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { formTitleCss } from '@/shared/ui/styles';

export function ReviewNewPage() {
  useDocumentTitle('리뷰 쓰기');
  const navigate = useNavigate();

  return (
    <RequireCritic>
      <h1 css={formTitleCss}>리뷰 쓰기</h1>
      <ReviewForm cancelTo={routes.home} onSaved={(id) => navigate(routes.review(id))} />
    </RequireCritic>
  );
}
