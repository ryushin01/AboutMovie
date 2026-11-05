import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_BYTES, readImageFile } from './readImageFile';

describe('readImageFile', () => {
  it('이미지를 data URL로 읽는다', async () => {
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    await expect(readImageFile(file)).resolves.toMatch(/^data:image\/png/);
  });

  it('이미지가 아니면 거부한다', async () => {
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    await expect(readImageFile(file)).rejects.toThrow('이미지 파일만');
  });

  it('용량을 넘으면 거부한다', async () => {
    const file = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'a.png', { type: 'image/png' });
    await expect(readImageFile(file)).rejects.toThrow('10MB');
  });
});
