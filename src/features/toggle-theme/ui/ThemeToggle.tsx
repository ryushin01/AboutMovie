import { useState } from 'react';
import { Button } from '@/shared/ui/Button';

const STORAGE_KEY = 'only-movie-theme';

export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const theme = next ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // 저장할 수 없는 환경이면 이번 방문에만 적용합니다.
    }
  };

  return (
    <Button variant="outline" onClick={toggle}>
      {dark ? '라이트 모드' : '다크 모드'}
    </Button>
  );
}
