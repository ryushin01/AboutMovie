import { css } from '@emotion/react';
import { Link, Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import { RequireAuth, useSession } from '@/entities/session';
import {
  activePlan,
  formatPrice,
  isPlanId,
  PLANS,
  useSubscription,
  type Plan,
} from '@/entities/subscription';
import { CheckoutForm } from '@/features/subscribe';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { buttonCss } from '@/shared/ui/Button';
import { PageMessage } from '@/shared/ui/PageMessage';

const route = getRouteApi('/checkout/$plan');

const titleCss = css`
  margin: 0;
  padding-block: clamp(24px, 4vw, 56px) 12px;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.03em;
`;

function Checkout({ plan }: { plan: Plan }) {
  const navigate = useNavigate();
  const { user } = useSession();
  const { data, isPending } = useSubscription(user?.id);

  if (isPending)
    return <output css={{ display: 'block', paddingTop: 32 }}>이용권을 확인하는 중입니다.</output>;
  // 이미 이용 중이면 두 번 결제하지 않도록 관리 화면으로 보냅니다.
  if (activePlan(data?.subscription)) return <Navigate {...routes.account} replace />;

  return (
    <>
      <h1 css={titleCss}>{plan.name} 이용권</h1>
      <p css={{ margin: '0 0 8px' }}>
        월 {formatPrice(plan.price)} · 최대 {plan.quality} 화질 · 동시 시청 {plan.screens}대
      </p>
      <p css={{ margin: '0 0 32px', color: 'var(--muted)' }}>
        실제 돈이 오가지 않는 가상 결제입니다. 카드 정보를 받지 않습니다.
      </p>
      <CheckoutForm plan={plan} onDone={() => navigate(routes.account)} />
    </>
  );
}

export function CheckoutPage() {
  const { plan } = route.useParams();
  const valid = isPlanId(plan);
  useDocumentTitle(valid ? `${PLANS[plan].name} 이용권 결제` : '이용권을 찾을 수 없습니다');

  if (!valid) {
    return (
      <PageMessage title="이용권을 찾을 수 없습니다">
        <Link {...routes.plans} css={buttonCss()}>
          이용권 보기
        </Link>
      </PageMessage>
    );
  }
  return (
    <RequireAuth>
      <Checkout plan={PLANS[plan]} />
    </RequireAuth>
  );
}
