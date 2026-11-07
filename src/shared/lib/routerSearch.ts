import { parseSearchWith, stringifySearchWith } from '@tanstack/react-router';

/**
 * 주소의 쿼리를 ?genre=액션&page=2처럼 평범하게 둡니다.
 * 라우터 기본값은 값을 JSON으로 바꿔("2" → 2, 문자열은 따옴표) 공유한 주소와 서버의 해석이 달라집니다.
 * 값은 모두 문자열로 읽고, 각 화면의 validateSearch가 형식을 맞춥니다.
 */
export const routerSearch = {
  parseSearch: parseSearchWith((value) => value),
  stringifySearch: stringifySearchWith(JSON.stringify),
};
