import { describe, expect, it } from 'vitest';
import { cardLayout } from './cardLayout';

describe('cardLayout', () => {
  it.each(Array.from({ length: 30 }, (_, index) => index + 2))(
    '%i장이면 모든 줄이 12칸으로 찬다',
    (count) => {
      const slots = cardLayout(count);
      expect(slots).toHaveLength(count);

      let filled = 0;
      for (const { span } of slots) {
        filled += span;
        expect(filled).toBeLessThanOrEqual(12);
        if (filled === 12) filled = 0;
      }
      expect(filled).toBe(0);
    },
  );

  it('없거나 한 장이어도 동작한다', () => {
    expect(cardLayout(0)).toEqual([]);
    expect(cardLayout(1)).toEqual([{ span: 6, offset: false }]);
  });

  it('샘플 3편은 큰 카드 1장과 작은 카드 2장으로 놓는다', () => {
    expect(cardLayout(3).map((slot) => slot.span)).toEqual([6, 3, 3]);
  });
});
