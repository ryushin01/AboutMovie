import { Link, useNavigate, useSearchParams } from 'react-router';
import { LoginForm } from '@/features/login';
import { routes, safeNext } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { formTitleCss } from '@/shared/ui/styles';

export function LoginPage() {
  useDocumentTitle('로그인');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');

  return (
    <>
      <h1 css={formTitleCss}>로그인</h1>
      <LoginForm onDone={() => navigate(safeNext(next), { replace: true })} />
      <p css={{ margin: '32px 0 0' }}>
        아직 회원이 아니신가요? <Link to={routes.signup(next ?? undefined)}>회원가입</Link>
      </p>
    </>
  );
}
