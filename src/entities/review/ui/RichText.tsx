import { css } from '@emotion/react';
import type { ReactNode } from 'react';
import { isSafeImagePath, isSafeLink, type RichMark, type RichNode } from '../model/richText';

const bodyCss = css`
  max-width: 44rem;
  font-size: clamp(1.0625rem, 1.4vw, 1.25rem);
  line-height: 1.8;
  overflow-wrap: anywhere;

  p {
    /* 빈 문단도 편집기에서 본 만큼 띄웁니다. */
    min-height: 1.8em;
    margin: 0 0 1em;
  }
  h2,
  h3 {
    margin: 1.6em 0 0.6em;
    line-height: 1.3;
  }
  h2 {
    font-size: 1.5em;
  }
  h3 {
    font-size: 1.2em;
  }
  ul,
  ol {
    margin: 0 0 1em;
    padding-left: 1.4em;
  }
  blockquote {
    margin: 0 0 1em;
    padding-left: 1em;
    color: var(--muted);
    border-left: 4px solid var(--accent);
  }
  a {
    color: var(--accent);
  }
  img {
    display: block;
    width: 100%;
    height: auto;
    margin: 1.5em 0;
    background: var(--surface);
  }
  hr {
    margin: 2em 0;
    border: 0;
    border-top: 1px solid var(--muted);
  }
`;

function withMark(children: ReactNode, mark: RichMark): ReactNode {
  switch (mark.type) {
    case 'bold':
      return <strong>{children}</strong>;
    case 'italic':
      return <em>{children}</em>;
    case 'underline':
      return <u>{children}</u>;
    case 'strike':
      return <s>{children}</s>;
    case 'link':
      return isSafeLink(mark.attrs?.href) ? (
        <a href={mark.attrs.href} rel="noopener noreferrer nofollow">
          {children}
        </a>
      ) : (
        children
      );
    default:
      return children;
  }
}

function renderNode(node: RichNode, key: number): ReactNode {
  const children = node.content?.map(renderNode);
  switch (node.type) {
    case 'text':
      return <span key={key}>{(node.marks ?? []).reduce(withMark, node.text as ReactNode)}</span>;
    case 'paragraph':
      return <p key={key}>{children}</p>;
    case 'heading':
      return node.attrs?.level === 3 ? <h3 key={key}>{children}</h3> : <h2 key={key}>{children}</h2>;
    case 'bulletList':
      return <ul key={key}>{children}</ul>;
    case 'orderedList':
      return <ol key={key}>{children}</ol>;
    case 'listItem':
      return <li key={key}>{children}</li>;
    case 'blockquote':
      return <blockquote key={key}>{children}</blockquote>;
    case 'hardBreak':
      return <br key={key} />;
    case 'horizontalRule':
      return <hr key={key} />;
    case 'image':
      return isSafeImagePath(node.attrs?.src) ? (
        <img key={key} src={node.attrs.src} alt={String(node.attrs.alt ?? '')} loading="lazy" />
      ) : null;
    default:
      return null;
  }
}

/** 편집기 본문을 그립니다. HTML을 그대로 넣지 않고 허용한 요소만 만들어 스크립트가 끼어들 수 없습니다. */
export function RichText({ doc }: { doc: RichNode }) {
  return <div css={bodyCss}>{doc.content?.map(renderNode)}</div>;
}
