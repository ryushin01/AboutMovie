import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { seedReviews } from '../model/seed';
import { ReviewCard } from './ReviewCard';

it('ReviewCard는 포스터 대체 텍스트와 상세 링크를 제공한다', () => {
  const review = seedReviews[0];
  renderWithProviders(<ReviewCard review={review} />);
  expect(screen.getByAltText(`${review.title} 포스터`)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: review.title })).toHaveAttribute('href', `/reviews/${review.id}`);
});
