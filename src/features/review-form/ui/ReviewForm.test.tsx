import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { set } from 'idb-keyval';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { ReviewForm } from './ReviewForm';

vi.mock('@/shared/lib/readImageFile', () => ({
  POSTER_MAX_EDGE: 1500,
  SCENE_MAX_EDGE: 1920,
  readImageFile: vi.fn(async () => 'data:image/png;base64,AA'),
}));
vi.mock('idb-keyval', async (importOriginal) => {
  const actual = await importOriginal<typeof import('idb-keyval')>();
  return { ...actual, set: vi.fn(actual.set) };
});

const image = (name: string) => new File(['x'], name, { type: 'image/png' });

describe('ReviewForm', () => {
  it('오류를 보여 주고 첫 오류 입력으로 초점을 옮긴다', async () => {
    const onSaved = vi.fn();
    renderWithProviders(<ReviewForm cancelTo="/" onSaved={onSaved} />);

    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByLabelText('영화 제목 (필수)')).toHaveFocus();
    expect(screen.getByText('오류: 포스터 이미지를 올려 주세요.')).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('장면 이미지와 설명까지 입력하면 저장한다', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    renderWithProviders(<ReviewForm cancelTo="/" onSaved={onSaved} />);

    await user.type(screen.getByLabelText('영화 제목 (필수)'), '새 영화');
    await user.type(screen.getByLabelText('개봉 연도 (필수)'), '2024');
    await user.selectOptions(screen.getByLabelText('평점 (필수)'), '4');
    await user.type(screen.getByLabelText('리뷰 내용 (필수)'), '좋았다');
    await user.upload(screen.getByLabelText('포스터 이미지 (필수)'), image('poster.png'));
    await screen.findByAltText('선택한 포스터 미리보기');
    await user.upload(screen.getByLabelText('영화 속 장면 이미지'), image('scene.png'));
    await user.type(await screen.findByLabelText('장면 1 설명 (필수)'), '바다');

    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it('저장에 실패하면 안내하고 다시 시도할 수 있다', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    renderWithProviders(<ReviewForm cancelTo="/" onSaved={onSaved} />);

    await user.type(screen.getByLabelText('영화 제목 (필수)'), '새 영화');
    await user.type(screen.getByLabelText('개봉 연도 (필수)'), '2024');
    await user.selectOptions(screen.getByLabelText('평점 (필수)'), '4');
    await user.type(screen.getByLabelText('리뷰 내용 (필수)'), '좋았다');
    await user.upload(screen.getByLabelText('포스터 이미지 (필수)'), image('poster.png'));
    await screen.findByAltText('선택한 포스터 미리보기');

    vi.mocked(set).mockRejectedValueOnce(new DOMException('full', 'QuotaExceededError'));
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('저장하지 못했습니다');
    expect(onSaved).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it('장면을 삭제하면 초점을 장면 입력으로 옮긴다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReviewForm cancelTo="/" onSaved={() => {}} />);

    await user.upload(screen.getByLabelText('영화 속 장면 이미지'), image('scene.png'));
    await user.click(await screen.findByRole('button', { name: '장면 1 삭제' }));

    expect(screen.queryByLabelText('장면 1 설명 (필수)')).not.toBeInTheDocument();
    expect(screen.getByLabelText('영화 속 장면 이미지')).toHaveFocus();
  });
});
