import { expect, it } from 'vitest';
import { createId } from './createId';

it('createId는 매번 다른 32자리 값을 만든다', () => {
  expect(createId()).toMatch(/^[0-9a-f]{32}$/);
  expect(createId()).not.toBe(createId());
});
