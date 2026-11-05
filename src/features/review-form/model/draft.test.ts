import { describe, expect, it } from 'vitest';
import type { RichDoc } from '@/entities/review';
import { isDraftChanged, toDraft, toReviewInput, validateDraft, type Draft } from './draft';

const body: RichDoc = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: '본문' }] }],
};
const valid: Draft = {
  ...toDraft(),
  title: ' 영화 ',
  year: '2024',
  rating: '4',
  genres: ['드라마'],
  poster: '/seed/a.svg',
  body,
};

describe('validateDraft', () => {
  it('올바른 입력은 오류가 없다', () => {
    expect(validateDraft(valid)).toEqual({});
  });

  it('빈 입력은 필수 항목 오류를 낸다', () => {
    expect(Object.keys(validateDraft(toDraft()))).toEqual([
      'title',
      'year',
      'rating',
      'genres',
      'poster',
      'body',
    ]);
  });

  it.each(['1800', '99999', '20.5'])('잘못된 연도 %s를 거부한다', (year) => {
    expect(validateDraft({ ...valid, year }).year).toBeDefined();
  });

  it('이미지만 있는 본문도 내용으로 인정한다', () => {
    const imageOnly: RichDoc = {
      type: 'doc',
      content: [{ type: 'image', attrs: { src: '/seed/a.svg', alt: '설명' } }],
    };
    expect(validateDraft({ ...valid, body: imageOnly }).body).toBeUndefined();
  });
});

it('toReviewInput은 숫자로 바꾸고 공백을 정리한다', () => {
  expect(toReviewInput(valid)).toMatchObject({ title: '영화', year: 2024, rating: 4, genres: ['드라마'] });
});

describe('isDraftChanged', () => {
  it('같으면 false', () => {
    expect(isDraftChanged(valid, { ...valid, body: structuredClone(body) })).toBe(false);
  });

  it('입력이나 본문이 바뀌면 true', () => {
    expect(isDraftChanged(valid, { ...valid, genres: ['SF'] })).toBe(true);
    expect(isDraftChanged(valid, { ...valid, body: { type: 'doc', content: [] } })).toBe(true);
  });
});
