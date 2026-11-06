import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installFakeApi } from '@/shared/lib/test/fakeApi';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { LoginForm } from './LoginForm';

const auth = vi.hoisted(() => ({
  login: vi.fn(),
  requestPasswordRecovery: vi.fn(),
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

    await user.type(screen.getByLabelText('이메일 (필수)'), 'member@example.com');
    await user.type(screen.getByLabelText('비밀번호 (필수)'), 'secret');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect(auth.login).toHaveBeenCalledWith('member@example.com', 'secret');
  });

  it('실패하면 안내하고 초점을 옮긴다', async () => {
    const user = userEvent.setup();
    auth.login.mockRejectedValue(new Error('invalid'));
    renderWithProviders(<LoginForm onDone={() => {}} />);

    await user.type(screen.getByLabelText('이메일 (필수)'), 'member@example.com');
    await user.type(screen.getByLabelText('비밀번호 (필수)'), 'wrong');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('맞지 않습니다');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus());
  });

  it('비밀번호를 잊으면 재설정 메일을 요청한다', async () => {
    const user = userEvent.setup();
    auth.requestPasswordRecovery.mockResolvedValue(undefined);
    renderWithProviders(<LoginForm onDone={() => {}} />);

    await user.click(screen.getByRole('button', { name: '비밀번호 찾기' }));
    await user.type(screen.getByLabelText('이메일 (필수)'), 'member@example.com');
    await user.click(screen.getByRole('button', { name: '재설정 메일 받기' }));

    expect(await screen.findByText(/재설정 메일이 도착합니다/)).toBeInTheDocument();
    expect(auth.requestPasswordRecovery).toHaveBeenCalledWith('member@example.com');
  });

  it('가입 확인 메일의 링크로 들어오면 로그인을 마친다', async () => {
    const onDone = vi.fn();
    window.location.hash = '#confirmation_token=abc';
    auth.handleAuthCallback.mockResolvedValue({ type: 'confirmation', user: {} });
    renderWithProviders(<LoginForm onDone={onDone} />);

    await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
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
