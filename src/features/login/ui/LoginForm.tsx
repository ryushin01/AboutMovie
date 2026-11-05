import { css } from '@emotion/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRefreshSession } from '@/entities/session';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { inputCss } from '@/shared/ui/styles';

const formCss = css`
  display: grid;
  gap: 24px;
  max-width: 420px;
`;
const alertCss = css`
  margin: 0;
  color: var(--accent);
  font-weight: 700;
`;

// 로그인 화면에서만 쓰므로 방문자가 받는 파일에 포함하지 않습니다.
const identity = () => import('@netlify/identity');

/** 초대·비밀번호 재설정 메일의 링크로 들어오면 새 비밀번호를 받습니다. */
type Mode = { type: 'login' } | { type: 'invite'; token: string } | { type: 'recovery' };

export function LoginForm({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<Mode>({ type: 'login' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const alertRef = useRef<HTMLParagraphElement>(null);
  const refreshSession = useRefreshSession();

  useEffect(() => {
    if (!/(invite|recovery|confirmation|access)_token=/.test(window.location.hash)) return;
    let active = true;
    identity()
      .then(({ handleAuthCallback }) => handleAuthCallback())
      .then((result) => {
        if (!active) return;
        if (result?.type === 'invite' && result.token) setMode({ type: 'invite', token: result.token });
        else if (result?.type === 'recovery') setMode({ type: 'recovery' });
        else if (result) void refreshSession().then(onDone);
      })
      .catch(() => {
        if (active) setError('링크가 만료되었거나 올바르지 않습니다.');
      });
    return () => {
      active = false;
    };
    // 주소의 토큰은 한 번만 처리합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) alertRef.current?.focus();
  }, [error]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setError('');
    setPending(true);
    try {
      const auth = await identity();
      if (mode.type === 'invite') await auth.acceptInvite(mode.token, password);
      else if (mode.type === 'recovery') await auth.updateUser({ password });
      else await auth.login(email, password);
      await refreshSession();
      onDone();
    } catch {
      setError(
        mode.type === 'login'
          ? '이메일이나 비밀번호가 맞지 않습니다.'
          : '비밀번호를 설정하지 못했습니다. 다시 시도해 주세요.',
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <form css={formCss} onSubmit={handleSubmit}>
      {mode.type === 'login' && (
        <Field label="이메일" required>
          {(control) => (
            <input
              {...control}
              css={inputCss}
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Field>
      )}
      <Field label={mode.type === 'login' ? '비밀번호' : '새 비밀번호'} required>
        {(control) => (
          <input
            {...control}
            css={inputCss}
            type="password"
            autoComplete={mode.type === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
      </Field>
      {error && (
        <p ref={alertRef} role="alert" tabIndex={-1} css={alertCss}>
          {error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? '확인 중…' : mode.type === 'login' ? '로그인' : '비밀번호 설정'}
        </Button>
      </div>
    </form>
  );
}
