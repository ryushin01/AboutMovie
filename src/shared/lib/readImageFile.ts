export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const POSTER_MAX_EDGE = 1500;
export const SCENE_MAX_EDGE = 1920;

/** 크기가 맞고 이 용량 이하면 화질을 지키도록 다시 인코딩하지 않습니다. */
const KEEP_ORIGINAL_BYTES = 300 * 1024;
const JPEG_QUALITY = 0.85;

export function fitWithin(width: number, height: number, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  // 아주 가는 이미지도 한 변이 0이 되면 저장할 수 없으므로 최소 1px을 유지합니다.
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`${file.name}: 파일을 읽지 못했습니다.`));
    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 파일을 올릴 data URL로 바꿉니다.
 * 긴 변을 maxEdge 이하로 줄이고, 브라우저가 표시할 수 없는 파일(HEIC 등)은 안내 문구로 거부합니다.
 * SVG는 스크립트를 담을 수 있고 서버도 받지 않으므로 일반 이미지로 다시 그립니다.
 */
export async function readImageFile(file: File, maxEdge: number): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error(`${file.name}: 이미지 파일만 올릴 수 있습니다.`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`${file.name}: 10MB 이하의 이미지만 올릴 수 있습니다.`);
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode().catch(() => {
      throw new Error(`${file.name}: 표시할 수 없는 이미지 형식입니다. JPG나 PNG로 올려 주세요.`);
    });

    const { width, height } = fitWithin(image.naturalWidth, image.naturalHeight, maxEdge);
    const fits = width === image.naturalWidth && file.size <= KEEP_ORIGINAL_BYTES;
    // 움직이는 GIF, WebP, APNG는 다시 그려야 멈추므로 JPEG만 원본을 씁니다.
    if (fits && file.type === 'image/jpeg') return await readAsDataUrl(file);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error(`${file.name}: 이미지를 처리하지 못했습니다.`);
    // JPEG에는 투명도가 없으므로 투명한 부분이 검게 되지 않도록 흰색을 깝니다.
    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(url);
  }
}
