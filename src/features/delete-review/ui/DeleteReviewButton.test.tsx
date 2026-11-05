import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installFakeApi, sampleReview } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { DeleteReviewButton } from './DeleteReviewButton';

describe('DeleteReviewButton', () => {
  afterEach(() => vi.restoreAllMocks());

  it('확인하면 삭제 후 알린다', async () => {
    installFakeApi({ reviews: [sampleReview({ id: 'x' })] });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onDeleted = vi.fn();
    renderWithProviders(<DeleteReviewButton id="x" title="영화" onDeleted={onDeleted} />);
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce());
  });

  it('취소하면 삭제하지 않는다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onDeleted = vi.fn();
    renderWithProviders(<DeleteReviewButton id="x" title="영화" onDeleted={onDeleted} />);
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
