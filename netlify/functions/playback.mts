import { getDatabase } from '@netlify/database';
import type { Config, Context } from '@netlify/functions';
import { isReleased } from '../../src/entities/movie/model/types';
import { activePlan, PLANS, watchBlock } from '../../src/entities/subscription/model/plans';
import { currentMember } from '../lib/auth';
import { findMovie } from '../lib/movieRepository';
import { getSubscription } from '../lib/subscriptionRepository';

const STATUS = { login_required: 401, plan_required: 403, upgrade_required: 403, not_released: 409 };

/** 재생 권한을 서버에서 확인합니다. 실제 영상은 없으므로 권한과 화질만 돌려줍니다. */
export default async (_req: Request, context: Context) => {
  const db = getDatabase().pool;
  const now = new Date();
  const movie = await findMovie(db, context.params.id);
  if (!movie) return Response.json({ error: 'not_found' }, { status: 404 });

  const member = await currentMember(context);
  const plan = member ? activePlan(await getSubscription(db, member.id, now)) : null;
  const block = watchBlock(
    { firstImport: movie.firstImport, released: isReleased(movie, now) },
    { loggedIn: Boolean(member), plan },
  );
  if (block) return Response.json({ error: block }, { status: STATUS[block] });
  return Response.json({ quality: PLANS[plan!].quality }, { headers: { 'Cache-Control': 'no-store' } });
};

export const config: Config = { path: '/api/movies/:id/playback' };
