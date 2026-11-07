/**
 * 회원과 무관한 작품 정보 응답에만 붙입니다. 함수와 DB를 깨우는 시간을 CDN이 대신 줄여 줍니다.
 * 찜, 이어 보기, 재생 권한처럼 회원마다 다른 응답에는 쓰면 안 됩니다.
 * 배포하면 CDN 캐시가 자동으로 비워지고, 그 사이 공개 상태 변경은 최대 몇 분 늦을 수 있습니다. 재생 권한은 서버가 따로 확인합니다.
 */
export const publicCatalogCache = {
  'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=60, stale-while-revalidate=300',
};
