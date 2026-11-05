import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { NotFoundPage } from './NotFoundPage';

it('NotFoundPage는 안내와 목록 링크를 보여 준다', () => {
  renderWithProviders(<NotFoundPage />);
  expect(screen.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '목록으로' })).toHaveAttribute('href', '/');
});
