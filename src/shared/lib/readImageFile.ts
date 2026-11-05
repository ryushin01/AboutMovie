export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** 이미지 파일을 저장할 수 있는 data URL로 읽습니다. 잘못된 파일이면 안내 문구로 거부합니다. */
export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error(`${file.name}: 이미지 파일만 올릴 수 있습니다.`));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error(`${file.name}: 10MB 이하의 이미지만 올릴 수 있습니다.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`${file.name}: 파일을 읽지 못했습니다.`));
    reader.readAsDataURL(file);
  });
}
