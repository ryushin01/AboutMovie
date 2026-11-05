import type { Context } from '@netlify/functions';
import { getUser, verifyRequestOrigin } from '@netlify/identity';

export const CRITIC_ROLE = 'critic';

/**
 * Identity는 로컬에서 동작하지 않으므로 로컬 개발에서는 운영자로 봅니다.
 * 배포된 함수에는 deploy.context가 항상 있어(production, deploy-preview 등) 여기에 해당하지 않습니다.
 */
const isLocalDev = (context: Context) => !context.deploy.context && Netlify.env.get('CONTEXT') === 'dev';

/** 글을 쓸 수 있는 사람인지 서버에서 확인합니다. 가입 가능 여부와 무관하게 역할로만 판단합니다. */
export async function isCritic(context: Context): Promise<boolean> {
  if (isLocalDev(context)) return true;
  const user = await getUser();
  return user?.roles?.includes(CRITIC_ROLE) ?? false;
}

/** 쓰기 요청을 막아야 하면 응답을 돌려줍니다. 쿠키 인증이므로 다른 사이트에서 온 요청도 함께 막습니다. */
export async function rejectUnlessCritic(req: Request, context: Context): Promise<Response | null> {
  if (!isLocalDev(context)) {
    try {
      verifyRequestOrigin(req);
    } catch {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }
  }
  return (await isCritic(context)) ? null : Response.json({ error: 'unauthorized' }, { status: 401 });
}
