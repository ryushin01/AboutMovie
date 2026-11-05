import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { ReviewNewPage } from './ReviewNewPage';

it('ReviewNewPage는 제목과 빈 작성 폼을 보여 준다', () => {
  renderWithProviders(<ReviewNewPage />);
  expect(screen.getByRole('heading', { level: 1, name: '리뷰 쓰기' })).toBeInTheDocument();
  expect(screen.getByLabelText('영화 제목 (필수)')).toHaveValue('');
  expect(document.title).toBe('리뷰 쓰기 | AboutMovie');
});
