import { useState } from 'react';
import { useRefreshSession } from '@/entities/session';
import { Button } from '@/shared/ui/Button';

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  const refreshSession = useRefreshSession();

  const handleClick = async () => {
    setPending(true);
    try {
      const { logout } = await import('@netlify/identity');
      await logout();
    } finally {
      await refreshSession();
      setPending(false);
    }
  };

  return (
    <Button variant="outline" disabled={pending} onClick={handleClick}>
      로그아웃
    </Button>
  );
}
