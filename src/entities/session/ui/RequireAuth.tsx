import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { routes } from '@/shared/config/routes';
import { useSession } from '../api/useSession';

/** 회원 화면을 감쌉니다. 로그인하지 않았으면 로그인 뒤 돌아오도록 로그인 화면으로 보냅니다. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isPending } = useSession();
  const { pathname, search } = useLocation();
  if (isPending) return <output css={{ display: 'block', paddingTop: 32 }}>확인하는 중입니다.</output>;
  return user ? children : <Navigate to={routes.login(pathname + search)} replace />;
}
