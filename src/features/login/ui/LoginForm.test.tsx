import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installFakeApi } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { LoginForm } from './LoginForm';

const auth = vi.hoisted(() => ({
  login: vi.fn(),
  acceptInvite: vi.fn(),
  updateUser: vi.fn(),
  handleAuthCallback: vi.fn(),
}));
vi.mock('@netlify/identity', () => auth);

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installFakeApi();
  });
  afterEach(() => {
    window.location.hash = '';
  });

  it('로그인하면 완료를 알린다', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    auth.login.mockResolvedValue({});
    renderWithProviders(<LoginForm onDone={onDone} />);

    await user.type(screen.getByLabelText('이메일 (필수)'), 'critic@example.com');
    await user.type(screen.getByLabelText('비밀번호 (필수)'), 'secret');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect(auth.login).toHaveBeenCalledWith('critic@example.com', 'secret');
  });

  it('실패하면 안내하고 초점을 옮긴다', async () => {
    const user = userEvent.setup();
    auth.login.mockRejectedValue(new Error('invalid'));
    renderWithProviders(<LoginForm onDone={() => {}} />);

    await user.type(screen.getByLabelText('이메일 (필수)'), 'critic@example.com');
    await user.type(screen.getByLabelText('비밀번호 (필수)'), 'wrong');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('맞지 않습니다');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus());
  });

  it('초대 링크로 들어오면 비밀번호를 정해 계정을 만든다', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    window.location.hash = '#invite_token=abc';
    auth.handleAuthCallback.mockResolvedValue({ type: 'invite', user: null, token: 'abc' });
    auth.acceptInvite.mockResolvedValue({});
    renderWithProviders(<LoginForm onDone={onDone} />);

    await user.type(await screen.findByLabelText('새 비밀번호 (필수)'), 'newpass');
    expect(screen.queryByLabelText('이메일 (필수)')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '비밀번호 설정' }));

    await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect(auth.acceptInvite).toHaveBeenCalledWith('abc', 'newpass');
  });

  it('비밀번호 재설정 링크로 들어오면 새 비밀번호를 저장한다', async () => {
    const user = userEvent.setup();
    window.location.hash = '#recovery_token=abc';
    auth.handleAuthCallback.mockResolvedValue({ type: 'recovery', user: {} });
    auth.updateUser.mockResolvedValue({});
    renderWithProviders(<LoginForm onDone={() => {}} />);

    await user.type(await screen.findByLabelText('새 비밀번호 (필수)'), 'newpass');
    await user.click(screen.getByRole('button', { name: '비밀번호 설정' }));

    await waitFor(() => expect(auth.updateUser).toHaveBeenCalledWith({ password: 'newpass' }));
  });
});
