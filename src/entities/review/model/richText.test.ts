import { describe, expect, it } from 'vitest';
import {
  imagePaths,
  isEmptyDoc,
  isSafeImagePath,
  isSafeLink,
  isValidRichDoc,
  plainText,
  type RichDoc,
} from './richText';

const doc = (...content: unknown[]) => ({ type: 'doc', content });
const text = (value: string, marks?: unknown[]) => ({ type: 'text', text: value, marks });
const para = (...content: unknown[]) => ({ type: 'paragraph', content });

describe('isValidRichDoc', () => {
  it('허용한 서식은 통과한다', () => {
    expect(
      isValidRichDoc(
        doc(
          { type: 'heading', attrs: { level: 2 }, content: [text('제목')] },
          para(
            text('굵게', [{ type: 'bold' }]),
            text('링크', [{ type: 'link', attrs: { href: 'https://a.example' } }]),
          ),
          { type: 'image', attrs: { src: '/api/images/a.png', alt: '설명' } },
          { type: 'bulletList', content: [{ type: 'listItem', content: [para(text('항목'))] }] },
        ),
      ),
    ).toBe(true);
  });

  it.each([
    ['허용하지 않은 요소', doc({ type: 'iframe' })],
    ['자바스크립트 링크', doc(para(text('x', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }])))],
    ['외부 이미지', doc({ type: 'image', attrs: { src: 'https://evil.example/a.png', alt: '설명' } })],
    ['대체 텍스트 없는 이미지', doc({ type: 'image', attrs: { src: '/seed/a.svg', alt: ' ' } })],
    ['h1 제목', doc({ type: 'heading', attrs: { level: 1 }, content: [text('x')] })],
    ['문자열 본문', '<p>x</p>'],
  ])('%s는 거부한다', (_name, value) => {
    expect(isValidRichDoc(value)).toBe(false);
  });

  it('지나치게 깊은 문서는 거부한다', () => {
    let node: unknown = para(text('x'));
    for (let i = 0; i < 30; i += 1) node = { type: 'blockquote', content: [node] };
    expect(isValidRichDoc(doc(node))).toBe(false);
  });
});

it('isSafeImagePath는 경로 이동을 막는다', () => {
  expect(isSafeImagePath('/seed/a-poster.svg')).toBe(true);
  expect(isSafeImagePath('/seed/../secret')).toBe(false);
  expect(isSafeImagePath('//evil.example/a.png')).toBe(false);
});

it('isSafeLink는 http와 https만 받는다', () => {
  expect(isSafeLink('https://a.example')).toBe(true);
  expect(isSafeLink('mailto:a@b.c')).toBe(false);
  expect(isSafeLink('없는 주소')).toBe(false);
});

it('글자와 이미지를 뽑아낸다', () => {
  const value = doc(para(text('첫 문단')), para(text('둘째')), {
    type: 'image',
    attrs: { src: '/seed/a.svg', alt: '설명' },
  }) as RichDoc;
  expect(plainText(value)).toBe('첫 문단 둘째');
  expect(imagePaths(value)).toEqual(['/seed/a.svg']);
  expect(isEmptyDoc(value)).toBe(false);
  expect(isEmptyDoc(doc(para()) as RichDoc)).toBe(true);
});
