import { describe, expect, it } from 'vitest';
import { fitWithin, MAX_IMAGE_BYTES, readImageFile } from './readImageFile';

// 실제 디코딩과 축소는 브라우저가 필요하므로 E2E에서 검사합니다.
describe('readImageFile', () => {
  it('이미지가 아니면 거부한다', async () => {
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    await expect(readImageFile(file, 100)).rejects.toThrow('이미지 파일만');
  });

  it('용량을 넘으면 거부한다', async () => {
    const file = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'a.png', { type: 'image/png' });
    await expect(readImageFile(file, 100)).rejects.toThrow('10MB');
  });
});

describe('fitWithin', () => {
  it('비율을 유지해 긴 변을 맞춘다', () => {
    expect(fitWithin(3000, 4500, 1500)).toEqual({ width: 1000, height: 1500 });
    expect(fitWithin(4000, 2250, 1920)).toEqual({ width: 1920, height: 1080 });
  });

  it('작은 이미지는 키우지 않는다', () => {
    expect(fitWithin(300, 200, 1500)).toEqual({ width: 300, height: 200 });
  });
});
