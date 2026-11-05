import { css } from '@emotion/react';

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
