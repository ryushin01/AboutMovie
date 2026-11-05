// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { detectImageType } from './imageStore';

describe('detectImageType', () => {
  it('내용으로 형식을 판단한다', () => {
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))?.ext).toBe('jpg');
    expect(detectImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))?.ext).toBe('png');
  });

  it('SVG와 HTML은 받지 않는다', () => {
    const encode = (text: string) => new TextEncoder().encode(text);
    expect(detectImageType(encode('<svg onload="alert(1)"></svg>'))).toBeNull();
    expect(detectImageType(encode('<!doctype html>'))).toBeNull();
  });
});
