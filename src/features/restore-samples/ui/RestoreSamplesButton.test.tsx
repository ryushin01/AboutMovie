import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { RestoreSamplesButton } from './RestoreSamplesButton';

it('RestoreSamplesButton은 되돌린 결과를 안내한다', async () => {
  renderWithProviders(<RestoreSamplesButton />);
  await userEvent.click(screen.getByRole('button', { name: '샘플 리뷰 되돌리기' }));
  expect(await screen.findByText(/처음 상태로 되돌렸습니다/)).toBeInTheDocument();
});
