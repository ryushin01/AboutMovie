import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { RichDoc } from '@/entities/review';
import { installFakeApi, sampleReview } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { ReviewForm } from './ReviewForm';

vi.mock('@/shared/lib/readImageFile', () => ({
  POSTER_MAX_EDGE: 1500,
  SCENE_MAX_EDGE: 1920,
  readImageFile: vi.fn(async () => 'data:image/png;base64,AA'),
}));

const image = (name: string) => new File(['x'], name, { type: 'image/png' });
// 본문 편집기 입력은 브라우저 동작이라 E2E에서 검사하고, 여기서는 기존 본문이 있는 글로 폼을 검사합니다.
const review = sampleReview() as never;

describe('ReviewForm', () => {
  it('오류를 보여 주고 첫 오류 입력으로 초점을 옮긴다', async () => {
    installFakeApi();
    const onSaved = vi.fn();
    renderWithProviders(<ReviewForm cancelTo="/" onSaved={onSaved} />);

    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByLabelText('영화 제목 (필수)')).toHaveFocus();
    expect(screen.getByText('오류: 포스터 이미지를 올려 주세요.')).toBeInTheDocument();
    expect(screen.getByText('오류: 장르를 선택해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('오류: 리뷰 내용을 입력해 주세요.')).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('포스터를 올려 받은 주소로 고친 내용을 저장한다', async () => {
    const user = userEvent.setup();
    const { state } = installFakeApi();
    const onSaved = vi.fn();
    renderWithProviders(<ReviewForm review={review} cancelTo="/" onSaved={onSaved} />);

    await user.upload(screen.getByLabelText('포스터 이미지 (필수)'), image('poster.png'));
    await screen.findByText('포스터 이미지를 넣었습니다.');
    await user.selectOptions(screen.getByLabelText('장르 (필수)'), 'SF');
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('sample-1'));
    const put = state.calls.find((call) => call.method === 'PUT');
    expect(put?.path).toBe('/api/reviews/sample-1');
    expect(put?.body).toMatchObject({ poster: '/api/images/uploaded.png', genre: 'SF' });
    expect((put!.body as { body: RichDoc }).body.type).toBe('doc');
  });

  it('포스터를 올리지 못하면 입력에 오류를 보여 준다', async () => {
    const user = userEvent.setup();
    const { state } = installFakeApi();
    state.fail = (_method, path) => path === '/api/images';
    renderWithProviders(<ReviewForm cancelTo="/" onSaved={() => {}} />);

    await user.upload(screen.getByLabelText('포스터 이미지 (필수)'), image('poster.png'));
    await waitFor(() =>
      expect(screen.getByLabelText('포스터 이미지 (필수)')).toHaveAttribute('aria-invalid', 'true'),
    );
  });

  it('저장에 실패하면 안내하고 다시 시도할 수 있다', async () => {
    const user = userEvent.setup();
    const { state } = installFakeApi();
    const onSaved = vi.fn();
    state.fail = (method) => method === 'PUT';
    renderWithProviders(<ReviewForm review={review} cancelTo="/" onSaved={onSaved} />);

    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('저장하지 못했습니다');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus());
    expect(onSaved).not.toHaveBeenCalled();

    state.fail = null;
    await user.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it('저장하는 동안 입력을 잠그고 한 번만 보낸다', async () => {
    const user = userEvent.setup();
    const { state } = installFakeApi();
    let finish = () => {};
    state.hold = new Promise<void>((resolve) => (finish = resolve));
    renderWithProviders(<ReviewForm review={review} cancelTo="/" onSaved={() => {}} />);

    const save = screen.getByRole('button', { name: '저장' });
    await user.click(save);
    await user.click(save);

    await waitFor(() => expect(screen.getByLabelText('영화 제목 (필수)')).toBeDisabled());
    finish();
    await waitFor(() => expect(state.calls.filter((call) => call.method === 'PUT')).toHaveLength(1));
  });

  it('편집기 도구 모음은 Tab으로 한 번만 들어온다', async () => {
    installFakeApi();
    renderWithProviders(<ReviewForm cancelTo="/" onSaved={() => {}} />);
    const toolbar = await screen.findByRole('toolbar', { name: '글 서식' });
    const focusable = toolbar.querySelectorAll('button[tabindex="0"]');
    expect(focusable).toHaveLength(1);
    expect(screen.getByRole('button', { name: '굵게' })).toHaveAttribute('aria-pressed', 'false');
  });
});
