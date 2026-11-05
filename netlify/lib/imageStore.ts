import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

const PRODUCTION_STORE = 'review-images';
const PREVIEW_STORE = 'review-images-preview';

// 사이트 단위 저장소는 모든 배포가 함께 씁니다. 미리보기가 운영 이미지를 건드리지 않도록 쓰는 곳을 나눕니다.
export const writableImages = (context: Context) =>
  getStore({
    name: context.deploy.context === 'production' ? PRODUCTION_STORE : PREVIEW_STORE,
    consistency: 'strong',
  });

/** 미리보기 DB는 운영 데이터의 복사본이라 운영 이미지 주소도 들어 있습니다. 읽을 때만 운영 저장소로 넘어갑니다. */
export const readableImages = (context: Context) =>
  context.deploy.context === 'production'
    ? [getStore(PRODUCTION_STORE)]
    : [getStore({ name: PREVIEW_STORE, consistency: 'strong' }), getStore(PRODUCTION_STORE)];

const SIGNATURES: { type: string; ext: string; matches: (b: Uint8Array) => boolean }[] = [
  { type: 'image/jpeg', ext: 'jpg', matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    type: 'image/png',
    ext: 'png',
    matches: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  { type: 'image/gif', ext: 'gif', matches: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
  {
    type: 'image/webp',
    ext: 'webp',
    matches: (b) => b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45,
  },
];

/** 올린 쪽이 알려 주는 형식을 믿지 않고 파일 내용으로 판단합니다. SVG는 스크립트를 담을 수 있어 받지 않습니다. */
export const detectImageType = (bytes: Uint8Array) =>
  SIGNATURES.find((signature) => signature.matches(bytes)) ?? null;
