// 첫 화면이 잘못된 테마로 깜빡이지 않도록 렌더링 전에 테마를 정합니다.
// CSP가 인라인 스크립트를 막으므로 파일로 두고, 렌더링을 멈추도록 defer 없이 불러옵니다.
(function () {
  var saved = null;
  try {
    saved = localStorage.getItem('only-movie-theme');
  } catch {
    // 저장소를 쓸 수 없으면 시스템 설정을 따릅니다.
  }
  var dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
