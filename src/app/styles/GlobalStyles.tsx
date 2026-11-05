import { css, Global } from '@emotion/react';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';

const styles = css`
  :root {
    --gutter: clamp(16px, 3vw, 48px);
    color-scheme: light;
    --bg: #f3f0e8;
    --surface: #e8e4d9;
    --ink: #15130f;
    --muted: #57524a;
    --accent: #a82c0c;
    --field-line: #77725f;
  }
  :root[data-theme='dark'] {
    color-scheme: dark;
    --bg: #0b0b0a;
    --surface: #1a1a18;
    --ink: #f3f0e8;
    --muted: #aeaa9e;
    --accent: #ff6a3d;
    --field-line: #8f8b80;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  html {
    -webkit-text-size-adjust: 100%;
  }
  body {
    margin: 0;
    color: var(--ink);
    background: var(--bg);
    font-family: 'Pretendard Variable', Pretendard, system-ui, sans-serif;
    font-size: 1rem;
    line-height: 1.5;
    /* 한글이 단어 중간에서 끊기지 않게 하되, 긴 문자열은 넘치지 않게 합니다. */
    word-break: keep-all;
    overflow-wrap: anywhere;
  }
  :focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
`;

export const GlobalStyles = () => <Global styles={styles} />;
