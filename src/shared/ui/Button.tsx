import { css } from '@emotion/react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'outline';

/** Link 등 다른 요소를 버튼 모양으로 만들 때도 씁니다. */
export const buttonCss = (variant: ButtonVariant = 'primary') => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 22px;
  color: ${variant === 'primary' ? 'var(--bg)' : 'var(--ink)'};
  background: ${variant === 'primary' ? 'var(--ink)' : 'transparent'};
  border: 1px solid var(--ink);
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition:
    color 0.15s,
    background 0.15s;

  &:hover:not(:disabled) {
    color: ${variant === 'primary' ? 'var(--ink)' : 'var(--bg)'};
    background: ${variant === 'primary' ? 'transparent' : 'var(--ink)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant, type = 'button', ...props }: ButtonProps) {
  return <button type={type} css={buttonCss(variant)} {...props} />;
}
