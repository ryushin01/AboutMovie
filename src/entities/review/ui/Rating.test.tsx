import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Rating } from './Rating';

it('Rating은 점수를 텍스트로 제공한다', () => {
  render(<Rating value={4} />);
  expect(screen.getByText('평점 5점 만점에 4점')).toBeInTheDocument();
});
