import { useState } from 'react';
import { Button } from '@/shared/ui/Button';

const STORAGE_KEY = 'about-movie-theme';

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
    <Button variant="outline" aria-pressed={dark} onClick={toggle}>
      <span aria-hidden="true" css={{ marginRight: 8 }}>
        {dark ? '●' : '○'}
      </span>
      다크 모드
    </Button>
  );
}
