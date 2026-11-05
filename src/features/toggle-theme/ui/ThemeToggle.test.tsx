import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

it('ThemeToggle은 테마를 바꾸고 저장한다', async () => {
  document.documentElement.dataset.theme = 'light';
  render(<ThemeToggle />);
  const button = screen.getByRole('button', { name: '다크 모드' });
  expect(button).toHaveAttribute('aria-pressed', 'false');

  await userEvent.click(button);

  expect(button).toHaveAttribute('aria-pressed', 'true');
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(localStorage.getItem('about-movie-theme')).toBe('dark');
});
