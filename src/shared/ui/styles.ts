import { css, keyframes } from '@emotion/react';

export const visuallyHidden = css`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`;

export const inputCss = css`
  width: 100%;
  min-height: 48px;
  padding: 10px 14px;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--field-line);
  border-radius: 0;
  font: inherit;

  &[aria-invalid='true'] {
    border: 2px solid var(--accent);
  }

  &::file-selector-button {
    min-height: 32px;
    margin-right: 12px;
    padding: 0 12px;
    color: var(--bg);
    background: var(--ink);
    border: 0;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
`;

export const formTitleCss = css`
  margin: 0;
  padding-block: clamp(32px, 6vw, 96px) clamp(24px, 4vw, 56px);
  font-size: clamp(2.75rem, 9vw, 10rem);
  font-weight: 900;
  line-height: 0.98;
  letter-spacing: -0.04em;
`;

const shimmer = keyframes`
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0 0;
  }
`;

/** 내용을 불러오는 동안의 자리. 움직임을 줄이도록 설정한 사용자에게는 멈춘 색면으로 보입니다. */
export const skeletonCss = css`
  background-color: var(--surface);
  background-image: linear-gradient(90deg, var(--surface) 25%, var(--skeleton) 50%, var(--surface) 75%);
  background-size: 300% 100%;
  animation: ${shimmer} 1.6s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    background-image: none;
    animation: none;
  }
`;
