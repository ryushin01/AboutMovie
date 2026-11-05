# 개발 가이드

## 구현 판단

| 주제 | 선택 | 이유 |
|---|---|---|
| 서버 | Netlify Functions + Database + Blobs + Identity | 이미 Netlify에 배포 중이라 새 서비스 계정이 필요 없고, 미리보기마다 DB 브랜치가 생깁니다. |
| 쓰기 권한 | 함수에서 `critic` 역할 확인 | Identity는 기본이 공개 가입이라 로그인만으로는 부족합니다. 화면의 메뉴 숨김은 편의일 뿐이고 서버가 요청마다 확인합니다. 쿠키 인증이므로 `verifyRequestOrigin`으로 다른 사이트의 요청도 막습니다. |
| 편집기 | Tiptap | 2026년 10~11월 npm 월간 다운로드가 `@tiptap/react` 약 8,209만, `@lexical/react` 약 2,323만, `@ckeditor/ckeditor5-react` 약 142만입니다. MIT 라이선스이고 UI를 직접 만들 수 있어 접근성을 맞추기 쉽습니다. 무거우므로 작성 화면에서만 받습니다. |
| 본문 저장 | Tiptap JSON (`jsonb`) | HTML을 저장하지 않습니다. 서버는 허용 목록(`richText.ts`)으로 검사하고, 화면은 `RichText`가 허용한 요소만 만들어 스크립트가 끼어들 수 없습니다. 읽는 화면에는 편집기를 싣지 않아 가볍습니다. |
| 이미지 | 브라우저에서 줄인 뒤 base64 JSON으로 업로드 | 함수 요청 본문 한도가 6MB입니다. 로컬 에뮬레이터가 바이너리 본문을 깨뜨려(70바이트 PNG가 15바이트로 도착) 로컬과 운영이 같은 경로를 타도록 JSON을 씁니다. 서버는 파일 내용으로 형식을 판단하고 SVG는 받지 않습니다. |
| 이미지 저장소 | 운영과 미리보기 분리 | 사이트 단위 Blobs는 모든 배포가 함께 쓰므로, 미리보기는 별도 저장소에 쓰고 읽을 때만 운영 저장소로 넘어갑니다. |
| SQL | `pg` 쿼리 직접 작성 | 표가 하나뿐이고, Drizzle은 Netlify 어댑터가 베타 버전에만 있습니다. |
| 장르 | TMDB 공식 장르 19개, `TEXT[]` | 목록을 추측하지 않으려고 [TMDB 문서](https://developer.themoviedb.org/reference/genre-movie-list)를 따르고 이름은 한국어로 옮겼습니다. 리뷰 한 편이 여러 장르에 속하고 표가 하나뿐이라 배열로 저장합니다. |
| 데이터 요청 | TanStack Query | 로딩·오류 상태와 저장 후 갱신을 한곳에서 처리합니다. |
| 가로 목록 | CSS `grid-auto-columns`와 scroll snap | 화면 폭별 카드 수(2.3~8.3)를 CSS만으로 정합니다. 소수점만큼 다음 카드가 보여 옆으로 더 있음을 알립니다. 카드는 링크라 Tab으로 넘어가면 브라우저가 스크롤합니다. |
| 테마 | CSS 변수와 `data-theme` | `index.html`의 인라인 스크립트가 렌더링 전에 테마를 정해 깜빡임을 막습니다. |
| ID | 서버의 `crypto.randomUUID` | 글과 이미지의 ID를 서버에서 만듭니다. |
| 린트 | oxlint | `typescript-eslint`가 TypeScript 7을 지원하지 않습니다. FSD 계층과 공개 API 규칙은 `no-restricted-imports`로 검사합니다. |
| esbuild 빌드 스크립트 | 실행하지 않음 (`pnpm-workspace.yaml`) | 없어도 빌드와 테스트가 동작합니다. 승인 여부를 정하지 않으면 `pnpm install`이 실패합니다. |
| 샘플 데이터 | 가상의 영화와 코드로 그린 SVG, 시드 마이그레이션 | 실제 영화 이미지의 저작권 문제를 피합니다. `scripts/generate-seed.mjs`와 원고 `scripts/seed-films.mjs`로 만듭니다. |

이미지 축소는 다음 규칙을 따릅니다.

- 크기가 기준 이내이고 300KB 이하인 JPEG는 원본을 그대로 올립니다.
- 그 밖에는 JPEG(품질 0.85)로 다시 인코딩합니다. 투명한 부분은 흰색이 되고, 움직이는 GIF는 멈춘 이미지가 됩니다.

## 테스트

| 종류 | 위치 | 검사 내용 |
|---|---|---|
| 단위·컴포넌트 | `src/**/*.test.ts(x)` | 입력 검증, 본문 허용 목록, 권한별 화면, 로그인·초대 흐름, 저장·불러오기 실패. API는 `shared/lib/test/fakeApi.ts`로 대신합니다. |
| 서버 | `netlify/lib/*.test.ts` | 실제 Postgres에 마이그레이션을 적용한 저장소와 시드, 입력 검증, 이미지 형식 판별 |
| E2E | `e2e/app.spec.ts` | Chromium, Firefox, WebKit에서 프로덕션 빌드의 작성·서식·본문 이미지·글과 이미지 번갈아 쓰기·장르 목록·수정·삭제, 방문자 권한, 화면 폭별 카드 수, 줄 넘기기, 중복 제출, 이탈 확인, 이미지 축소, 테마, 키보드, 컨트롤 크기, 폭 320·1440·2200px의 넘침과 axe 검사. `vite preview`에 함수가 없어 API는 `e2e/fakeApi.ts`로 대신합니다. |
| 배포 검사 | `e2e/live.spec.ts` | 배포된 사이트의 읽기, 이미지, axe, 비로그인·다른 사이트의 쓰기 거부. 운영 데이터를 바꾸지 않습니다. |

```bash
pnpm exec playwright install chromium firefox webkit  # 처음 한 번
pnpm build
pnpm test:e2e
```

E2E는 기본으로 포트 4310을 쓰며, `E2E_PORT`로 바꿀 수 있습니다. jsdom에서는 이미지를 디코딩할 수 없어 실제 축소는 E2E에서 검사합니다.

CI는 `main` 푸시와 PR마다 타입 검사, 린트, 포맷 검사, 단위 테스트, 빌드, E2E를 실행합니다.

## 성능

- 편집기(약 130KB, gzip)와 로그인 코드는 필요한 화면에서만 받습니다.
- 이전 구조의 Lighthouse 수치는 서버 도입으로 맞지 않아 지웠습니다. 2.0.0 배포 후 다시 측정해 적습니다.

## 접근성

항목별 결과는 [접근성 점검](accessibility.md)을 참고하세요. axe를 통과했다고 KWCAG를 준수한다는 뜻은 아닙니다.

## 배포 전 설정

Identity는 API가 없어 대시보드에서만 설정합니다. 처음 한 번 순서대로 합니다.

1. **Netlify Database:** `@netlify/database`가 있으면 첫 배포 때 만들어지고 마이그레이션이 적용됩니다. 크레딧 기반 요금제에서만 쓸 수 있고 사용량에 따라 크레딧을 씁니다.
2. **Identity 켜기:** Project configuration의 Identity(`https://app.netlify.com/projects/<사이트 이름>/identity`)에서 켭니다.
3. **가입 막기:** Registration을 **Invite only**로 바꿉니다.
4. **운영자 초대:** Users에서 이메일로 초대하고, 메일의 링크로 들어와 비밀번호를 정합니다. 링크는 사이트 첫 화면으로 오고 `/login`에서 처리합니다.
5. **역할 주기:** 그 사용자에게 `critic` 역할을 넣습니다. 역할은 **다음 로그인이나 토큰 갱신부터** 적용되므로 다시 로그인합니다.

## 로컬 개발

- `pnpm dev`가 `@netlify/vite-plugin`으로 함수, DB, Blobs를 흉내 냅니다. DB 파일은 `.netlify/db`에 있습니다.
- 마이그레이션은 자동으로 적용되지 않습니다. `pnpm dev`를 켠 채로 `pnpm db:migrate`를 실행합니다.
- Identity는 로컬에서 동작하지 않아, 로컬 함수에서는 운영자로 간주합니다(`netlify/lib/auth.ts`). 배포된 함수에는 해당하지 않습니다. 로그인 흐름은 배포 미리보기에서 확인합니다.
- 시작할 때 `Failed retrieving site data`가 나면 상위 폴더의 `.netlify/state.json`이 다른 사이트를 가리키는 경우입니다. `netlify link`로 이 프로젝트를 연결하거나, 이 폴더에 `.netlify/state.json`을 `{}`로 만듭니다.

## 배포 시 유의점

- `main`에 병합하면 Netlify가 `netlify.toml` 설정으로 빌드하고 **마이그레이션을 적용한 뒤** 배포합니다. 이어서 `.github/workflows/live-check.yml`이 `version.txt`로 해당 커밋의 배포를 확인한 뒤, 세 브라우저로 배포된 사이트를 검사합니다.
- 적용된 마이그레이션은 고치거나 지우면 배포가 실패합니다. 항상 새 파일을 추가합니다.
- 미리보기는 운영 데이터가 복사된 DB 브랜치를 쓰고, 미리보기 주소는 공개입니다.
- 직접 주소는 SPA 대체 규칙으로 HTTP 200을 돌려줍니다. 없는 주소는 앱의 404 화면이 열리지만 HTTP 상태는 200입니다.
- 없는 `/assets/*`는 앱 화면이 아니라 404로 응답합니다. `robots.txt`처럼 고정 주소로 읽는 파일은 `public/`에 두어야 대체 규칙에 걸리지 않습니다.
- 공유 미리보기 정보는 `index.html` 하나뿐이어서 어느 주소를 공유해도 목록 기준으로 보입니다.
- `og:image`와 `og:url`은 배포 주소를 절대 경로로 씁니다. 주소가 바뀌면 `index.html`도 고칩니다.

## 알려진 제한

- 목록 카드는 2:3 틀을 유지하므로, 비율이 다른 포스터에는 배경색 여백이 생깁니다.
- 파일 선택 버튼 문구는 브라우저 언어를 따릅니다. 영어 브라우저에서는 "Choose File"로 표시됩니다.
- 글을 수정하며 빼거나 바꾼 이미지와, 올린 뒤 저장하지 않은 이미지는 저장소에 남습니다. 글을 삭제할 때는 그 글이 쓰던 이미지를 함께 지웁니다.
- 로그인, 초대, 역할 확인은 배포 환경에서만 끝까지 동작합니다. 자동 테스트는 Identity를 대신해 검사합니다.
