# AboutMovie

[![CI](https://github.com/ryushin01/AboutMovie/actions/workflows/ci.yml/badge.svg)](https://github.com/ryushin01/AboutMovie/actions/workflows/ci.yml)
![version](https://img.shields.io/badge/version-1.1.0-a82c0c)

영화 포스터와 장면 이미지를 곁들여 리뷰를 쓰는 영화 리뷰 블로그입니다. 서버 없이 브라우저만으로 작성부터 저장까지 동작합니다.

> **프로젝트 상태:** **포트폴리오용 데모**입니다. 리뷰와 이미지는 방문자의 브라우저(IndexedDB)에만 저장되어 다른 사람에게 공개되지 않고, 브라우저 데이터를 지우면 함께 사라집니다. 처음 보이는 영화와 리뷰는 모두 가상 데이터입니다.

## 화면

화면의 영화와 리뷰는 모두 가상 데이터이고, 포스터와 장면 이미지는 코드로 그린 것입니다.

![목록에서 리뷰 쓰기로 이동해 제목, 포스터, 본문, 장면을 입력하고 저장한 뒤 상세 화면과 라이트 모드, 새 카드가 추가된 목록을 차례로 보여 주는 시연](docs/images/demo.gif)

| 목록 (다크 모드) | 목록 (라이트 모드) |
|---|---|
| ![검은 배경에 ABOUT MOVIE 대형 제목과 가상 영화 포스터 카드가 놓인 목록 화면](docs/images/home-dark.jpg) | ![밝은 배경에 ABOUT MOVIE 대형 제목과 가상 영화 포스터 카드가 놓인 목록 화면](docs/images/home-light.jpg) |

| 리뷰 상세 | 리뷰 쓰기 |
|---|---|
| ![대형 영화 제목 아래에 포스터, 평점, 리뷰 본문, 수정과 삭제 버튼이 놓인 상세 화면](docs/images/detail-dark.jpg) | ![제목, 개봉 연도, 평점, 포스터 이미지, 리뷰 내용을 입력하는 작성 화면](docs/images/write-light.jpg) |

## 주요 기능

- 리뷰 작성, 수정, 삭제 (제목, 개봉 연도, 평점, 본문)
- 포스터 이미지와 영화 속 장면 이미지 업로드 (장당 10MB 이하, 장면은 여러 장)
- 큰 이미지 자동 축소, 브라우저가 표시할 수 없는 형식은 안내 후 거부
- 장면 설명을 이미지의 대체 텍스트로 사용
- 작성 중 나가기 전 확인, 다른 탭의 변경 바로 반영
- 다크 모드 (처음에는 시스템 설정을 따르고, 고른 값을 기억)
- 처음 방문하면 가상 샘플 리뷰 3편을 표시, 지우거나 고쳐도 버튼 하나로 되돌리기 (직접 쓴 리뷰는 유지)

## 기술 스택

![React, Vite, TypeScript, pnpm, Vitest](https://skillicons.dev/icons?i=react,vite,ts,pnpm,vitest)

| 구분 | 사용 기술 |
|---|---|
| 프레임워크 | React 19, Vite 8, TypeScript 7, React Router 8 |
| 상태·데이터 | TanStack Query v5, idb-keyval (IndexedDB) |
| 스타일 | Emotion, Pretendard |
| 품질 | oxlint, Prettier, Vitest + React Testing Library, Playwright + axe (Chromium, Firefox, WebKit E2E) |
| 자동화 | GitHub Actions |

## 시작하기

Node.js 26(`.nvmrc`)과 pnpm이 필요합니다.

```bash
nvm use
pnpm install
pnpm dev    # http://localhost:5173
```

| 명령 | 설명 |
|---|---|
| `pnpm build` | 타입 검사와 프로덕션 빌드 |
| `pnpm typecheck` / `lint` / `format` | 타입 검사 / 린트(접근성, FSD 계층 포함) / 코드 정리 |
| `pnpm test` | 단위·컴포넌트 테스트 |
| `pnpm test:e2e` | 프로덕션 빌드의 흐름·넘침·접근성 검사 (먼저 `build` 필요) |
| `pnpm screenshots` / `demo-gif` | README 스크린샷 / 시연 GIF 다시 만들기 (먼저 `build` 필요) |

## 프로젝트 구조

[Feature-Sliced Design](https://feature-sliced.design)을 따릅니다. 컴포넌트 옆에 `*.test.tsx`를 둡니다.

```
.github/            CI
docs/               개발 가이드, 접근성 점검, README 스크린샷
e2e/                E2E 테스트
src/
├─ app/             진입점, 라우터, 전역 스타일과 테마 색상
├─ pages/           home, review-detail, review-new, review-edit, not-found
├─ widgets/         site-layout (머리글, 본문 바로가기, 바닥글)
├─ features/        review-form, delete-review, restore-samples, toggle-theme
├─ entities/review/ 리뷰 저장소, 쿼리, 샘플 데이터, 카드
└─ shared/          공통 UI, 경로, 유틸리티
```

## 문서

| 문서 | 내용 |
|---|---|
| [개발 가이드](docs/development.md) | 구현 판단, 테스트 구성, 배포 시 유의점, 알려진 제한 |
| [접근성 점검](docs/accessibility.md) | KWCAG 2.2 항목별 자체 점검 결과 |
| [변경 기록](CHANGELOG.md) | 버전별 변경 내용 |
