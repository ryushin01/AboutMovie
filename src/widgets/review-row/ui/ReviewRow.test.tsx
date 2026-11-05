import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import type { Review } from '@/entities/review';
import { sampleReview } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { ReviewRow } from './ReviewRow';

it('ReviewRow는 제목으로 구역 이름을 정하고 카드를 목록으로 보여 준다', () => {
  const reviews = [sampleReview(), sampleReview({ id: 'b', title: '유리 궤도' })] as unknown as Review[];
  renderWithProviders(<ReviewRow title="드라마" reviews={reviews} />);
  expect(screen.getByRole('region', { name: '드라마' })).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
});
