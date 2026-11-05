// 편집기 본문(JSON)의 허용 목록입니다. 서버 검증과 화면 표시가 같은 규칙을 씁니다.
// netlify/ 함수에서도 가져오므로 이 파일은 @/ 경로와 브라우저 API를 쓰지 않습니다.

export interface RichMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface RichNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  marks?: RichMark[];
  text?: string;
}

export interface RichDoc extends RichNode {
  type: 'doc';
}

const NODES = new Set([
  'doc',
  'paragraph',
  'heading',
  'text',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'hardBreak',
  'horizontalRule',
  'image',
]);
const MARKS = new Set(['bold', 'italic', 'underline', 'strike', 'link']);
const MAX_DEPTH = 12;

/** 본문과 포스터의 이미지는 이 사이트가 내보내는 주소만 허용합니다. */
export const isSafeImagePath = (src: unknown): src is string =>
  typeof src === 'string' && /^\/(api\/images|seed)\/[\w.-]+$/.test(src) && !src.includes('..');

export function isSafeLink(href: unknown): href is string {
  if (typeof href !== 'string') return false;
  try {
    return ['http:', 'https:'].includes(new URL(href).protocol);
  } catch {
    return false;
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isValidMark(mark: unknown): boolean {
  if (!isObject(mark) || typeof mark.type !== 'string' || !MARKS.has(mark.type)) return false;
  return mark.type !== 'link' || (isObject(mark.attrs) && isSafeLink(mark.attrs.href));
}

function isValidNode(node: unknown, depth: number): boolean {
  if (depth > MAX_DEPTH || !isObject(node) || typeof node.type !== 'string' || !NODES.has(node.type)) {
    return false;
  }
  if (node.type === 'text' && typeof node.text !== 'string') return false;
  if (node.type === 'heading') {
    if (!isObject(node.attrs) || ![2, 3].includes(node.attrs.level as number)) return false;
  }
  if (node.type === 'image') {
    if (!isObject(node.attrs) || !isSafeImagePath(node.attrs.src)) return false;
    // 이미지마다 대체 텍스트가 있어야 합니다. (KWCAG 5.1.1)
    if (typeof node.attrs.alt !== 'string' || !node.attrs.alt.trim()) return false;
  }
  if (node.marks !== undefined && !(Array.isArray(node.marks) && node.marks.every(isValidMark))) return false;
  if (node.content === undefined) return true;
  return Array.isArray(node.content) && node.content.every((child) => isValidNode(child, depth + 1));
}

export const isValidRichDoc = (value: unknown): value is RichDoc =>
  isObject(value) && value.type === 'doc' && isValidNode(value, 0);

export const emptyDoc = (): RichDoc => ({ type: 'doc', content: [{ type: 'paragraph' }] });

function collect(node: RichNode, visit: (node: RichNode) => void) {
  visit(node);
  node.content?.forEach((child) => collect(child, visit));
}

/** 블록을 빈 줄로 나누지 않고 공백 하나로 이은 글자입니다. 요약과 빈 본문 검사에 씁니다. */
export function plainText(doc: RichNode): string {
  const parts: string[] = [];
  collect(doc, (node) => {
    if (node.text) parts.push(node.text);
    else if (node.type === 'paragraph' || node.type === 'heading') parts.push(' ');
  });
  return parts.join('').replace(/\s+/g, ' ').trim();
}

/** 글자가 없어도 이미지가 있으면 내용이 있는 것으로 봅니다. */
export function isEmptyDoc(doc: RichNode): boolean {
  let hasImage = false;
  collect(doc, (node) => {
    if (node.type === 'image') hasImage = true;
  });
  return !hasImage && plainText(doc) === '';
}

export function imagePaths(doc: RichNode): string[] {
  const paths: string[] = [];
  collect(doc, (node) => {
    if (node.type === 'image' && typeof node.attrs?.src === 'string') paths.push(node.attrs.src);
  });
  return paths;
}
