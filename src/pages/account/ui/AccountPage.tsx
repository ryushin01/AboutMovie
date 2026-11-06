import { css } from '@emotion/react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useLibrary } from '@/entities/movie';
import { RequireAuth, useSession, type SessionUser } from '@/entities/session';
import { activePlan, formatPrice, PLANS, useSubscription, type Payment } from '@/entities/subscription';
import { DeleteAccountButton } from '@/features/delete-account';
import { SubscriptionManager } from '@/features/manage-subscription';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { buttonCss } from '@/shared/ui/Button';
import { MovieRow } from '@/widgets/movie-row';

const titleCss = css`
  margin: 0;
  padding-block: clamp(24px, 4vw, 56px) 12px;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.03em;
`;
const sectionCss = css`
  max-width: 60rem;
  margin-top: 32px;
  padding: 24px;
  background: var(--surface);

  h2 {
    margin: 0 0 8px;
    font-size: 1.375rem;
    font-weight: 800;
  }
`;
const scrollCss = css`
  overflow-x: auto;
`;
const tableCss = css`
  width: 100%;
  border-collapse: collapse;

  caption {
    margin-bottom: 8px;
    text-align: left;
    font-size: 1.375rem;
    font-weight: 800;
  }
  th,
  td {
    padding: 8px 12px 8px 0;
    border-bottom: 1px solid var(--field-line);
    text-align: left;
    white-space: nowrap;
  }
`;

const KIND = { new: '신규', renewal: '정기 결제', upgrade: '이용권 올림' };
const STATUS = { paid: '성공', failed: '실패' };

const day = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', { dateStyle: 'medium', timeZone: 'Asia/Seoul' });

function Payments({ payments }: { payments: Payment[] }) {
  return (
    <div css={sectionCss}>
      {/* 좁은 화면에서 옆으로 밀어 보는 영역이므로 키보드로도 스크롤할 수 있게 합니다. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <section css={scrollCss} aria-labelledby="payments-title" tabIndex={0}>
        <table css={tableCss}>
          <caption id="payments-title">가상 결제 내역</caption>
          <thead>
            <tr>
              <th scope="col">날짜</th>
              <th scope="col">이용권</th>
              <th scope="col">구분</th>
              <th scope="col">금액</th>
              <th scope="col">결과</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{day(payment.createdAt)}</td>
                <td>{PLANS[payment.plan].name}</td>
                <td>{KIND[payment.kind]}</td>
                <td>{formatPrice(payment.amount)}</td>
                <td>{STATUS[payment.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Account({ user, onDeleted }: { user: SessionUser; onDeleted: () => void }) {
  const { data, isPending, isError } = useSubscription(user.id);
  const plan = activePlan(data?.subscription);
  const { data: library } = useLibrary(user.id);

  return (
    <>
      <h1 css={titleCss}>내 계정</h1>
      <p css={{ margin: 0 }}>
        {user.name ? `${user.name} · ` : ''}
        {user.email}
      </p>
      {isPending && <output css={{ display: 'block', marginTop: 32 }}>이용권을 확인하는 중입니다.</output>}
      {isError && (
        <p role="alert" css={{ marginTop: 32 }}>
          이용권을 불러오지 못했습니다. 새로고침해 주세요.
        </p>
      )}
      {data && (
        <>
          <section css={sectionCss}>
            <h2>{plan ? `${PLANS[plan].name} 이용권 이용 중` : '이용 중인 이용권이 없습니다'}</h2>
            {plan && data.subscription ? (
              <SubscriptionManager subscription={data.subscription} />
            ) : (
              <Link to={routes.plans} css={[buttonCss(), { marginTop: 12 }]}>
                이용권 보기
              </Link>
            )}
          </section>
          {data.payments.length > 0 && <Payments payments={data.payments} />}
        </>
      )}
      {library && library.watchlist.length > 0 && <MovieRow title="찜한 영화" movies={library.watchlist} />}
      <section css={sectionCss}>
        <h2>회원 탈퇴</h2>
        <p css={{ margin: '0 0 12px' }}>계정과 이용권, 결제 내역, 찜 목록, 이어 보기 기록을 모두 지웁니다.</p>
        <DeleteAccountButton onDone={onDeleted} />
      </section>
    </>
  );
}

export function AccountPage() {
  useDocumentTitle('내 계정');
  const { user } = useSession();
  // 세션이 비기 전에 세우므로, 탈퇴한 사람이 로그인 화면으로 가는 순간이 생기지 않습니다.
  const [deleted, setDeleted] = useState(false);
  if (deleted) return <Navigate to={routes.home} replace />;
  return <RequireAuth>{user && <Account user={user} onDeleted={() => setDeleted(true)} />}</RequireAuth>;
}
