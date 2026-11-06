import {
  isUpgrade,
  PLANS,
  type Payment,
  type PlanId,
  type Subscription,
  type SubscriptionData,
} from '../../src/entities/subscription/model/plans';
import type { Queryable } from './db';

interface Row {
  plan: PlanId;
  pending_plan: PlanId | null;
  status: Subscription['status'];
  cancel_at_period_end: boolean;
  started_at: Date;
  current_period_end: Date;
}

const toSubscription = (row: Row): Subscription => ({
  plan: row.plan,
  pendingPlan: row.pending_plan,
  status: row.status,
  cancelAtPeriodEnd: row.cancel_at_period_end,
  startedAt: row.started_at.toISOString(),
  currentPeriodEnd: row.current_period_end.toISOString(),
});

/**
 * 결제 기간이 지났으면 상태를 맞춥니다. 예약 작업을 두지 않고 읽을 때 처리합니다.
 * 기간 종료일을 조건에 넣어, 요청이 겹쳐도 한 기간은 한 번만 결제됩니다.
 */
async function settle(db: Queryable, userId: string, now: Date): Promise<Subscription | null> {
  for (;;) {
    const { rows } = await db.query('SELECT * FROM subscriptions WHERE user_id = $1', [userId]);
    const row = rows[0] as Row | undefined;
    if (!row) return null;
    if (row.status !== 'active' || row.current_period_end > now) return toSubscription(row);

    if (row.cancel_at_period_end) {
      await db.query(
        `UPDATE subscriptions SET status = 'expired', cancel_at_period_end = false, pending_plan = NULL
         WHERE user_id = $1 AND status = 'active' AND current_period_end = $2`,
        [userId, row.current_period_end],
      );
      continue;
    }

    const plan = row.pending_plan ?? row.plan;
    await db.query(
      `WITH renewed AS (
         UPDATE subscriptions
         SET plan = $3, pending_plan = NULL, current_period_end = current_period_end + interval '1 month'
         WHERE user_id = $1 AND status = 'active' AND current_period_end = $2
         RETURNING user_id
       )
       INSERT INTO payments (id, user_id, plan, amount, kind, status, created_at)
       SELECT $4, user_id, $3, $5, 'renewal', 'paid', $2 FROM renewed`,
      [userId, row.current_period_end, plan, crypto.randomUUID(), PLANS[plan].price],
    );
  }
}

export const getSubscription = settle;

export async function getSubscriptionData(
  db: Queryable,
  userId: string,
  now: Date,
): Promise<SubscriptionData> {
  const subscription = await settle(db, userId, now);
  const { rows } = await db.query(
    `SELECT id, plan, amount, kind, status, created_at FROM payments
     WHERE user_id = $1 ORDER BY created_at DESC, id LIMIT 24`,
    [userId],
  );
  const payments = (rows as (Omit<Payment, 'createdAt'> & { created_at: Date })[]).map(
    ({ created_at, ...payment }) => ({ ...payment, createdAt: created_at.toISOString() }),
  );
  return { subscription, payments };
}

export type SubscribeResult = 'ok' | 'already_subscribed' | 'payment_failed';

/**
 * 가상 결제로 이용권을 시작합니다. 구독과 결제 기록을 한 문장으로 처리해 함께 성공하거나 실패합니다.
 * 이미 이용 중이면 충돌 조건에 걸려 아무것도 쓰지 않으므로, 중복 요청에 두 번 결제되지 않습니다.
 */
export async function subscribe(
  db: Queryable,
  userId: string,
  plan: PlanId,
  now: Date,
  { simulateFailure = false } = {},
): Promise<SubscribeResult> {
  const current = await settle(db, userId, now);
  if (current?.status === 'active') return 'already_subscribed';

  if (simulateFailure) {
    await db.query(
      `INSERT INTO payments (id, user_id, plan, amount, kind, status, created_at)
       VALUES ($1, $2, $3, $4, 'new', 'failed', $5)`,
      [crypto.randomUUID(), userId, plan, PLANS[plan].price, now],
    );
    return 'payment_failed';
  }

  const { rows } = await db.query(
    `WITH started AS (
       INSERT INTO subscriptions (user_id, plan, status, started_at, current_period_end)
       VALUES ($1, $2, 'active', $3, $3::timestamptz + interval '1 month')
       ON CONFLICT (user_id) DO UPDATE
       SET plan = EXCLUDED.plan, pending_plan = NULL, status = 'active', cancel_at_period_end = false,
           started_at = EXCLUDED.started_at, current_period_end = EXCLUDED.current_period_end
       WHERE subscriptions.status = 'expired'
       RETURNING user_id
     )
     INSERT INTO payments (id, user_id, plan, amount, kind, status, created_at)
     SELECT $4, user_id, $2, $5, 'new', 'paid', $3 FROM started
     RETURNING id`,
    [userId, plan, now, crypto.randomUUID(), PLANS[plan].price],
  );
  return rows.length > 0 ? 'ok' : 'already_subscribed';
}

export type ChangeResult = 'ok' | 'no_subscription' | 'invalid_state';

const activeRow = `user_id = $1 AND status = 'active'`;

/** 해지를 예약합니다. 결제 기간이 끝날 때까지는 계속 볼 수 있습니다. */
export async function cancelSubscription(db: Queryable, userId: string, now: Date): Promise<ChangeResult> {
  await settle(db, userId, now);
  const { rows } = await db.query(
    `UPDATE subscriptions SET cancel_at_period_end = true, pending_plan = NULL
     WHERE ${activeRow} RETURNING user_id`,
    [userId],
  );
  return rows.length > 0 ? 'ok' : 'no_subscription';
}

export async function resumeSubscription(db: Queryable, userId: string, now: Date): Promise<ChangeResult> {
  await settle(db, userId, now);
  const { rows } = await db.query(
    `UPDATE subscriptions SET cancel_at_period_end = false WHERE ${activeRow} RETURNING user_id`,
    [userId],
  );
  return rows.length > 0 ? 'ok' : 'no_subscription';
}

/**
 * 상위 이용권은 바로 적용하고 차액을 결제합니다. 하위 이용권은 다음 결제일부터 적용합니다.
 * 해지 예약 중에는 먼저 해지를 취소해야 합니다.
 */
export async function changePlan(
  db: Queryable,
  userId: string,
  plan: PlanId,
  now: Date,
): Promise<ChangeResult> {
  const current = await settle(db, userId, now);
  if (current?.status !== 'active') return 'no_subscription';
  if (current.cancelAtPeriodEnd) return 'invalid_state';

  if (plan === current.plan) {
    // 같은 이용권을 고르면 예약해 둔 변경을 취소합니다.
    if (!current.pendingPlan) return 'invalid_state';
    await db.query(`UPDATE subscriptions SET pending_plan = NULL WHERE ${activeRow}`, [userId]);
    return 'ok';
  }

  if (!isUpgrade(current.plan, plan)) {
    await db.query(`UPDATE subscriptions SET pending_plan = $2 WHERE ${activeRow}`, [userId, plan]);
    return 'ok';
  }

  const { rows } = await db.query(
    `WITH upgraded AS (
       UPDATE subscriptions SET plan = $2, pending_plan = NULL
       WHERE ${activeRow} AND plan = $3 AND NOT cancel_at_period_end
       RETURNING user_id
     )
     INSERT INTO payments (id, user_id, plan, amount, kind, status, created_at)
     SELECT $4, user_id, $2, $5, 'upgrade', 'paid', $6 FROM upgraded
     RETURNING id`,
    [userId, plan, current.plan, crypto.randomUUID(), PLANS[plan].price - PLANS[current.plan].price, now],
  );
  return rows.length > 0 ? 'ok' : 'invalid_state';
}
