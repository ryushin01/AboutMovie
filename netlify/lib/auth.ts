import type { Context } from '@netlify/functions';
import { getUser, verifyRequestOrigin } from '@netlify/identity';

export interface Member {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Identity는 로컬에서 동작하지 않으므로 로컬 개발에서는 가상의 회원으로 봅니다.
 * 배포된 함수에는 deploy.context가 항상 있어(production, deploy-preview 등) 여기에 해당하지 않습니다.
 */
export const isLocalDev = (context: Context) =>
  !context.deploy.context && Netlify.env.get('CONTEXT') === 'dev';

const LOCAL_MEMBER: Member = { id: 'local-member', email: 'member@example.com', name: '로컬 회원' };

export async function currentMember(context: Context): Promise<Member | null> {
  if (isLocalDev(context)) return LOCAL_MEMBER;
  const user = await getUser();
  return user ? { id: user.id, email: user.email ?? '', name: user.name ?? null } : null;
}

export const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });

/** 쿠키 인증이므로 상태를 바꾸는 요청은 다른 사이트에서 온 것을 막습니다. 막아야 하면 응답을 돌려줍니다. */
export function rejectCrossSite(req: Request, context: Context): Response | null {
  if (isLocalDev(context)) return null;
  try {
    verifyRequestOrigin(req);
    return null;
  } catch {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }
}
