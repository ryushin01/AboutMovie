import type { Config, Context } from '@netlify/functions';
import { isCritic } from '../lib/auth';

/** 화면에서 쓰기 메뉴를 보여 줄지 정할 때만 씁니다. 실제 권한은 쓰기 요청마다 다시 확인합니다. */
export default async (_req: Request, context: Context) =>
  Response.json({ isCritic: await isCritic(context) }, { headers: { 'Cache-Control': 'no-store' } });

export const config: Config = { path: '/api/me' };
