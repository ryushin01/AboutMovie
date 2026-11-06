import type { Config, Context } from '@netlify/functions';
import { currentMember } from '../lib/auth';

/** 머리글과 재생 안내에 쓸 로그인 상태입니다. 실제 권한은 요청마다 서버가 다시 확인합니다. */
export default async (_req: Request, context: Context) => {
  const member = await currentMember(context);
  return Response.json(
    { user: member && { email: member.email, name: member.name, id: member.id } },
    { headers: { 'Cache-Control': 'no-store' } },
  );
};

export const config: Config = { path: '/api/me' };
