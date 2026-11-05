import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { PageMessage } from './PageMessage';

it('PageMessage는 제목을 h1로 보여 준다', () => {
  render(<PageMessage title="없음" />);
  expect(screen.getByRole('heading', { level: 1, name: '없음' })).toBeInTheDocument();
});
