import type { Review } from './types';

// 저작권 문제가 없도록 가상의 영화와 코드로 그린 이미지만 씁니다.
const svg = (markup: string) => `data:image/svg+xml,${encodeURIComponent(markup)}`;

const poster = (lines: string[], from: string, to: string) =>
  svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
  <rect width="600" height="900" fill="url(#g)"/>
  <circle cx="430" cy="290" r="190" fill="#fff" opacity=".14"/>
  ${lines
    .map(
      (line, i) =>
        `<text x="44" y="${680 + i * 92}" font-family="sans-serif" font-size="84" font-weight="800" fill="#fff">${line}</text>`,
    )
    .join('')}
</svg>`);

const scene = (from: string, to: string, horizon: number) =>
  svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#g)"/>
  <circle cx="1120" cy="${horizon - 90}" r="130" fill="#fff" opacity=".55"/>
  <rect y="${horizon}" width="1600" height="${900 - horizon}" fill="#000" opacity=".45"/>
</svg>`);

const NOTE = '※ 포트폴리오 데모용으로 만든 가상의 영화 리뷰입니다. 직접 수정하거나 삭제해 볼 수 있습니다.';

export const seedReviews: Review[] = [
  {
    id: 'sample-last-screening',
    title: '마지막 상영',
    year: 2025,
    rating: 5,
    poster: poster(['마지막', '상영'], '#7a1f12', '#1b0d0a'),
    scenes: [
      { id: 's1', src: scene('#d9562e', '#2a0f0a', 620), description: '붉은 노을 아래 지평선 위로 해가 걸린 풍경' },
      { id: 's2', src: scene('#5b2a1e', '#120807', 700), description: '어두운 극장 바깥으로 저녁빛이 번지는 풍경' },
    ],
    body: `문 닫는 동네 극장의 마지막 밤을 그린 이 영화는 큰 사건 없이도 끝까지 시선을 붙잡는다.

영사기 돌아가는 소리와 객석의 숨소리만으로 쌓아 올린 후반 20분은 올해 본 가장 아름다운 장면이다.

${NOTE}`,
    createdAt: '2026-03-03T09:00:00.000Z',
    updatedAt: '2026-03-03T09:00:00.000Z',
  },
  {
    id: 'sample-winter-route',
    title: '겨울의 항로',
    year: 2024,
    rating: 4,
    poster: poster(['겨울의', '항로'], '#1d4e6b', '#08151e'),
    scenes: [{ id: 's1', src: scene('#7fb2c9', '#0b2230', 560), description: '차가운 푸른빛 바다 위로 낮은 해가 뜬 풍경' }],
    body: `얼어붙은 바다를 건너는 쇄빙선 선원들의 이야기. 느린 호흡이 지루함과 긴장 사이를 아슬아슬하게 오간다.

결말은 호불호가 갈리겠지만, 화면에 담긴 추위만큼은 객석까지 그대로 전해진다.

${NOTE}`,
    createdAt: '2026-02-11T09:00:00.000Z',
    updatedAt: '2026-02-11T09:00:00.000Z',
  },
  {
    id: 'sample-under-neon',
    title: '네온 아래서',
    year: 2023,
    rating: 3,
    poster: poster(['네온', '아래서'], '#5a1d7a', '#120a24'),
    scenes: [{ id: 's1', src: scene('#b23bd1', '#140a2a', 640), description: '보랏빛 네온이 번지는 밤하늘과 도시의 그림자' }],
    body: `비 내리는 도시의 밤을 쫓는 추격극. 색감과 음악은 훌륭하지만 이야기가 스타일을 따라가지 못한다.

그래도 빗속 옥상 시퀀스 하나만으로 극장에서 볼 이유는 충분하다.

${NOTE}`,
    createdAt: '2026-01-20T09:00:00.000Z',
    updatedAt: '2026-01-20T09:00:00.000Z',
  },
];
