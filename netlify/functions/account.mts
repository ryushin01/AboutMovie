import { getDatabase } from '@netlify/database';
import type { Config, Context } from '@netlify/functions';
import { admin, logout } from '@netlify/identity';
import { currentMember, isLocalDev, rejectCrossSite, unauthorized } from '../lib/auth';
import { deleteMemberData } from '../lib/libraryRepository';

/**
 * 회원 탈퇴. 기록을 먼저 지우고 계정을 지웁니다. 두 단계 모두 다시 실행해도 안전합니다.
 * 반대로 하면 계정만 지워진 뒤 기록 삭제가 실패했을 때, 로그인할 수 없어 다시 시도할 길이 없습니다.
 */
export default async (req: Request, context: Context) => {
  if (req.method !== 'DELETE') return new Response('Method not allowed', { status: 405 });
  const rejected = rejectCrossSite(req, context);
  if (rejected) return rejected;
  const member = await currentMember(context);
  if (!member) return unauthorized();

  await deleteMemberData(getDatabase().pool, member.id);

  // 로컬에는 Identity가 없어 기록만 지웁니다.
  if (!isLocalDev(context)) {
    await admin.deleteUser(member.id);
    // 계정을 지워도 로그인 쿠키는 만료될 때까지 유효하므로 함께 지웁니다. 탈퇴는 이미 끝났으므로 실패해도 성공으로 답합니다.
    await logout().catch(() => {});
  }
  return new Response(null, { status: 204 });
};

export const config: Config = { path: '/api/account' };
