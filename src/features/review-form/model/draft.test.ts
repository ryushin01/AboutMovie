import { describe, expect, it } from 'vitest';
import { toDraft, toReviewInput, validateDraft } from './draft';

const valid = { ...toDraft(), title: ' 영화 ', year: '2024', rating: '4', poster: 'data:x', body: '본문' };

describe('validateDraft', () => {
  it('올바른 입력은 오류가 없다', () => {
    expect(validateDraft(valid)).toEqual({});
  });

  it('빈 입력은 필수 항목 오류를 낸다', () => {
    expect(Object.keys(validateDraft(toDraft()))).toEqual(['title', 'year', 'rating', 'poster', 'body']);
  });

  it.each(['1800', '99999', '20.5'])('잘못된 연도 %s를 거부한다', (year) => {
    expect(validateDraft({ ...valid, year }).year).toBeDefined();
  });

  it('설명 없는 장면을 거부한다', () => {
    const scenes = [{ id: 'a', src: 'data:x', description: ' ' }];
    expect(validateDraft({ ...valid, scenes }).scenes).toHaveProperty('a');
  });
});

it('toReviewInput은 숫자로 바꾸고 공백을 정리한다', () => {
  expect(toReviewInput(valid)).toMatchObject({ title: '영화', year: 2024, rating: 4 });
});
