import { getDatabase } from '@netlify/database';
import type { Config, Context } from '@netlify/functions';
import { admin, logout } from '@netlify/identity';
import { currentMember, isLocalDev, rejectCrossSite, unauthorized } from '../lib/auth';
import { deleteMemberData } from '../lib/libraryRepository';

/**
 * 회원 탈퇴. 계정을 먼저 지웁니다.
 * 반대로 하면 계정 삭제가 실패했을 때 이용권과 기록만 사라진 계정이 남습니다.
 */
export default async (req: Request, context: Context) => {
  if (req.method !== 'DELETE') return new Response('Method not allowed', { status: 405 });
  const rejected = rejectCrossSite(req, context);
  if (rejected) return rejected;
  const member = await currentMember(context);
  if (!member) return unauthorized();

  // 로컬에는 Identity가 없어 기록만 지웁니다.
  if (!isLocalDev(context)) {
    await admin.deleteUser(member.id);
    // 계정을 지워도 로그인 쿠키는 만료될 때까지 유효하므로 함께 지웁니다.
    await logout();
  }
  await deleteMemberData(getDatabase().pool, member.id);
  return new Response(null, { status: 204 });
};

export const config: Config = { path: '/api/account' };
