import { useNavigate } from 'react-router';
import { LoginForm } from '@/features/login';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { formTitleCss } from '@/shared/ui/styles';

export function LoginPage() {
  useDocumentTitle('운영자 로그인');
  const navigate = useNavigate();

  return (
    <>
      <h1 css={formTitleCss}>운영자 로그인</h1>
      <p css={{ margin: '0 0 32px', color: 'var(--muted)' }}>리뷰를 쓰는 평론가 계정으로 로그인합니다.</p>
      <LoginForm onDone={() => navigate(routes.home, { replace: true })} />
    </>
  );
}
