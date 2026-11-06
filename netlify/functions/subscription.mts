import { getDatabase } from '@netlify/database';
import type { Config, Context } from '@netlify/functions';
import { isPlanId } from '../../src/entities/subscription/model/plans';
import { currentMember, rejectCrossSite, unauthorized } from '../lib/auth';
import {
  cancelSubscription,
  changePlan,
  getSubscriptionData,
  resumeSubscription,
  subscribe,
} from '../lib/subscriptionRepository';

const invalid = () => Response.json({ error: 'invalid' }, { status: 400 });
const noStore = { headers: { 'Cache-Control': 'no-store' } };

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
    const rejected = rejectCrossSite(req, context);
    if (rejected) return rejected;
  }
  const member = await currentMember(context);
  if (!member) return unauthorized();

  const db = getDatabase().pool;
  const now = new Date();
  const ok = async (status = 200) =>
    Response.json(await getSubscriptionData(db, member.id, now), { status, ...noStore });

  if (req.method === 'GET') return ok();

  const input = (await req.json().catch(() => null)) as {
    plan?: unknown;
    action?: unknown;
    simulateFailure?: unknown;
  } | null;

  if (req.method === 'POST') {
    if (!isPlanId(input?.plan)) return invalid();
    const result = await subscribe(db, member.id, input.plan, now, {
      simulateFailure: input.simulateFailure === true,
    });
    if (result === 'payment_failed') return Response.json({ error: result }, { status: 402 });
    if (result === 'already_subscribed') return Response.json({ error: result }, { status: 409 });
    return ok(201);
  }

  if (req.method === 'PATCH') {
    let result;
    if (input?.action === 'cancel') result = await cancelSubscription(db, member.id, now);
    else if (input?.action === 'resume') result = await resumeSubscription(db, member.id, now);
    else if (input?.action === 'change' && isPlanId(input.plan))
      result = await changePlan(db, member.id, input.plan, now);
    else return invalid();
    return result === 'ok' ? ok() : Response.json({ error: result }, { status: 409 });
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config: Config = { path: '/api/subscription' };
