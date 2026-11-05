import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { installFakeApi } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { ReviewDetailPage } from './ReviewDetailPage';

const renderAt = (path: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/reviews/:id" element={<ReviewDetailPage />} />
    </Routes>,
    path,
  );

describe('ReviewDetailPage', () => {
  it('본문과 이미지를 대체 텍스트와 함께 보여 준다', async () => {
    installFakeApi();
    renderAt('/reviews/sample-1');
    expect(await screen.findByRole('heading', { level: 1, name: '마지막 상영' })).toBeInTheDocument();
    expect(screen.getByAltText('마지막 상영 포스터')).toBeInTheDocument();
    expect(screen.getByAltText('붉은 노을 풍경')).toBeInTheDocument();
    expect(screen.getByText('문 닫는 극장의 마지막 밤.')).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('마지막 상영 | AboutMovie'));
  });

  it('방문자에게는 수정과 삭제를 보여 주지 않는다', async () => {
    installFakeApi({ isCritic: false });
    renderAt('/reviews/sample-1');
    await screen.findByRole('heading', { level: 1, name: '마지막 상영' });
    await waitFor(() => expect(screen.queryByRole('link', { name: '수정' })).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument();
  });

  it('운영자에게는 수정과 삭제를 보여 준다', async () => {
    installFakeApi();
    renderAt('/reviews/sample-1');
    expect(await screen.findByRole('link', { name: '수정' })).toHaveAttribute(
      'href',
      '/reviews/sample-1/edit',
    );
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
  });

  it('없는 리뷰를 안내한다', async () => {
    installFakeApi();
    renderAt('/reviews/nope');
    expect(await screen.findByRole('heading', { name: '리뷰를 찾을 수 없습니다' })).toBeInTheDocument();
  });

  it('불러오지 못하면 알린다', async () => {
    const { state } = installFakeApi();
    state.fail = (_method, path) => path.startsWith('/api/reviews/');
    renderAt('/reviews/sample-1');
    expect(await screen.findByRole('alert')).toHaveTextContent('불러오지 못했습니다');
  });
});
