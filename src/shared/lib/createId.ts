/** crypto.randomUUID와 달리 HTTPS가 아닌 주소에서도 동작합니다. */
export const createId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
