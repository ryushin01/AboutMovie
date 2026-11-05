// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parseReviewFields } from './reviewInput';

const body = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '본문' }] }] };
const valid = {
  title: ' 영화 ',
  year: 2025,
  rating: 4,
  genres: ['드라마'],
  poster: '/api/images/a.jpg',
  body,
};
const invalidOf = (patch: object) => {
  const result = parseReviewFields({ ...valid, ...patch });
  return 'invalid' in result ? result.invalid : [];
};

describe('parseReviewFields', () => {
  it('올바른 값은 다듬어서 돌려준다', () => {
    const result = parseReviewFields(valid);
    expect('fields' in result && result.fields.title).toBe('영화');
  });

  it.each([
    [{ title: ' ' }, 'title'],
    [{ title: 'a'.repeat(101) }, 'title'],
    [{ year: 1800 }, 'year'],
    [{ year: '2024' }, 'year'],
    [{ rating: 6 }, 'rating'],
    [{ genres: ['없는 장르'] }, 'genres'],
    [{ genres: [] }, 'genres'],
    [{ genres: '드라마' }, 'genres'],
    [{ genres: ['드라마', '드라마'] }, 'genres'],
    [{ poster: 'https://evil.example/a.jpg' }, 'poster'],
    [{ poster: 'javascript:alert(1)' }, 'poster'],
    [{ body: { type: 'doc', content: [{ type: 'paragraph' }] } }, 'body'],
    [{ body: '<script>alert(1)</script>' }, 'body'],
    [{ body: { type: 'doc', content: [{ type: 'iframe' }] } }, 'body'],
  ])('%j는 거부한다', (patch, field) => {
    expect(invalidOf(patch)).toContain(field);
  });

  it('입력이 객체가 아니어도 오류 없이 거부한다', () => {
    expect('invalid' in parseReviewFields(null)).toBe(true);
  });
});
