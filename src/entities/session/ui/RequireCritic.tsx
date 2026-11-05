import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { routes } from '@/shared/config/routes';
import { useSession } from '../api/useSession';

/** 운영자 화면을 감쌉니다. 로그인하지 않았으면 로그인 화면으로 보냅니다. */
export function RequireCritic({ children }: { children: ReactNode }) {
  const { isCritic, isPending } = useSession();
  if (isPending) return <output css={{ display: 'block' }}>확인하는 중입니다.</output>;
  return isCritic ? children : <Navigate to={routes.login} replace />;
}
