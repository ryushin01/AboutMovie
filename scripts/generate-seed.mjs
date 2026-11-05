// 가상의 영화 리뷰로 포스터·장면 SVG(public/seed)와 시드 마이그레이션을 만듭니다. 한 번 실행하고 결과를 커밋합니다.
// 적용된 마이그레이션은 고칠 수 없으므로, 내용을 바꾸려면 OUT을 새 파일로 바꿔 새 마이그레이션을 추가합니다.
import { mkdirSync, writeFileSync } from 'node:fs';
import { NEW_FILMS, ORIGINAL_EXTRAS } from './seed-films.mjs';

const OUT = 'netlify/database/migrations/20261105000300_seed_more_reviews.sql';
const NOTE = '이 글은 포트폴리오를 위해 지어낸 가상의 영화 리뷰입니다.';

// 처음 만든 16편: [id, 제목, 연도, 평점, 장르, 포스터 시작색, 끝색, 작성일, 장면 설명, 문단1, 문단2]
const ORIGINAL_FILMS = [
  [
    'last-screening',
    '마지막 상영',
    2025,
    5,
    '드라마',
    '#7a1f12',
    '#1b0d0a',
    '2026-10-28',
    '붉은 노을 아래 지평선 위로 해가 걸린 풍경',
    '문 닫는 동네 극장의 마지막 밤을 그린 이 영화는 큰 사건 없이도 끝까지 시선을 붙잡는다.',
    '영사기 돌아가는 소리와 객석의 숨소리만으로 쌓아 올린 후반 20분은 올해 본 가장 아름다운 장면이다.',
  ],
  [
    'winter-route',
    '겨울의 항로',
    2024,
    4,
    '드라마',
    '#1d4e6b',
    '#08151e',
    '2026-10-21',
    '차가운 푸른빛 바다 위로 낮은 해가 뜬 풍경',
    '얼어붙은 바다를 건너는 쇄빙선 선원들의 이야기. 느린 호흡이 지루함과 긴장 사이를 아슬아슬하게 오간다.',
    '결말은 호불호가 갈리겠지만, 화면에 담긴 추위만큼은 객석까지 그대로 전해진다.',
  ],
  [
    'neon-rain',
    '네온 레인',
    2026,
    3,
    '스릴러',
    '#5a1a6b',
    '#0d0614',
    '2026-10-14',
    '보랏빛 비가 내리는 밤거리 풍경',
    '비에 젖은 도심을 달리는 추격 장면까지는 근래 스릴러 가운데 가장 날카롭다.',
    '다만 반전을 설명하는 마지막 10분이 앞서 쌓은 긴장을 스스로 풀어 버린다.',
  ],
  [
    'silent-floor',
    '조용한 층',
    2025,
    4,
    '스릴러',
    '#3b3f46',
    '#0c0d0f',
    '2026-10-07',
    '불 꺼진 사무실 복도 끝의 희미한 불빛',
    '야근하는 직원들만 남은 빌딩에서 벌어지는 실종 사건을 다룬다. 공간을 다루는 솜씨가 빼어나다.',
    '소리를 덜어낸 연출 덕분에 관객은 어느새 숨을 죽이고 복도 끝을 살피게 된다.',
  ],
  [
    'glass-orbit',
    '유리 궤도',
    2026,
    5,
    'SF',
    '#12506b',
    '#04121c',
    '2026-09-30',
    '행성 위로 떠오르는 푸른 빛',
    '궤도 정거장에 홀로 남은 관측원의 기록. 거대한 설정보다 한 사람의 고독에 집중한 선택이 빛난다.',
    '우주를 비추는 긴 고정 숏은 근래 SF가 잊고 있던 경외감을 되살린다.',
  ],
  [
    'second-sun',
    '두 번째 태양',
    2024,
    3,
    'SF',
    '#8a5a12',
    '#1c1104',
    '2026-09-23',
    '사막 위로 뜬 두 개의 태양',
    '설정은 흥미롭지만 세계관 설명에 러닝타임을 너무 많이 쓴다.',
    '그럼에도 황량한 사막을 담은 미술만큼은 큰 화면으로 볼 가치가 있다.',
  ],
  [
    'spring-letter',
    '봄의 답장',
    2025,
    4,
    '로맨스',
    '#b0476a',
    '#2b0f1a',
    '2026-09-16',
    '벚꽃이 흩날리는 강변 산책로',
    '편지로만 이어지는 두 사람의 십 년을 담담하게 따라간다.',
    '두 배우가 한 화면에 서는 장면은 단 하나뿐인데, 그 한 장면을 위해 모든 시간이 쌓인다.',
  ],
  [
    'midnight-bakery',
    '자정의 빵집',
    2023,
    3,
    '로맨스',
    '#a3672c',
    '#24140a',
    '2026-09-09',
    '불 켜진 빵집 창문 너머의 밤거리',
    '달콤한 설정에 기대는 순간이 많지만 배우들의 호흡이 그 약점을 대부분 덮는다.',
    '가볍게 즐기기에는 부족함이 없는 소품이다.',
  ],
  [
    'wrong-wedding',
    '엉뚱한 결혼식',
    2025,
    4,
    '코미디',
    '#c4832a',
    '#2c1b08',
    '2026-09-02',
    '하객 없는 결혼식장에 놓인 빈 의자들',
    '잘못 배달된 청첩장 한 장에서 시작하는 소동극. 타이밍으로 웃기는 법을 아는 드문 코미디다.',
    '중반의 식탁 장면은 혼자 봐도 소리 내어 웃게 된다.',
  ],
  [
    'office-picnic',
    '사무실 소풍',
    2024,
    2,
    '코미디',
    '#4f8a3a',
    '#10200b',
    '2026-08-26',
    '회의실에 펼쳐 놓은 돗자리',
    '직장 풍자로 시작하지만 같은 농담을 반복하다 힘을 잃는다.',
    '조연들의 즉흥 연기가 아니었다면 끝까지 보기 어려웠을 것이다.',
  ],
  [
    'iron-harbor',
    '철의 항구',
    2026,
    4,
    '액션',
    '#8c2a1e',
    '#180806',
    '2026-08-19',
    '화물 컨테이너가 쌓인 항구의 해질녘',
    '컨테이너 부두 한 곳에서 90분을 버티는 액션. 합을 끊지 않는 촬영이 체력의 한계까지 보여 준다.',
    '서사는 단순하지만 몸으로 쓴 장면들이 그 단순함을 오히려 장점으로 만든다.',
  ],
  [
    'night-express',
    '야간 급행',
    2023,
    3,
    '액션',
    '#1f3a7a',
    '#070d1f',
    '2026-08-12',
    '어둠 속을 달리는 열차의 창문 불빛',
    '달리는 열차라는 익숙한 무대를 성실하게 활용한다. 새롭지는 않아도 지루할 틈은 없다.',
    '후반의 객차 분리 장면은 충분히 기억할 만하다.',
  ],
  [
    'salt-makers',
    '소금을 만드는 사람들',
    2025,
    5,
    '다큐멘터리',
    '#6b7f8c',
    '#14191c',
    '2026-08-05',
    '해 질 무렵 염전에 비친 하늘',
    '사라져 가는 염전의 한 해를 내레이션 없이 기록한다. 인내심 있는 카메라가 노동의 리듬을 그대로 옮긴다.',
    '마지막 수확 장면에 이르면 소금 한 줌의 무게가 다르게 느껴진다.',
  ],
  [
    'city-of-pigeons',
    '비둘기의 도시',
    2024,
    3,
    '다큐멘터리',
    '#5e5a72',
    '#121018',
    '2026-07-29',
    '광장 위를 나는 비둘기 떼',
    '도심 비둘기와 함께 사는 사람들을 따라간다. 소재의 재미에 비해 구성은 다소 느슨하다.',
    '그래도 노년의 사육사가 전하는 이야기만큼은 오래 남는다.',
  ],
  [
    'paper-whale',
    '종이 고래',
    2026,
    5,
    '애니메이션',
    '#1f7a8c',
    '#06202a',
    '2026-07-22',
    '종이로 접은 고래가 헤엄치는 밤하늘',
    '손으로 접은 종이의 질감을 그대로 살린 화면이 시작부터 눈을 사로잡는다.',
    '어린 관객을 얕보지 않는 이야기 덕분에 어른에게 더 깊게 남는다.',
  ],
  [
    'little-lighthouse',
    '작은 등대',
    2023,
    4,
    '애니메이션',
    '#c25a3c',
    '#2a100a',
    '2026-07-15',
    '파도 위로 빛을 비추는 작은 등대',
    '바닷가 마을의 등대를 지키는 아이의 모험. 단순한 그림체가 오히려 감정을 또렷하게 전한다.',
    '음악과 파도 소리의 조화가 특히 좋다.',
  ],
];

const esc = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

function posterSvg(title, from, to) {
  // 긴 제목은 두 줄로 나눕니다.
  const words = title.split(' ');
  const lines = words.length > 1 ? [words.slice(0, -1).join(' '), words.at(-1)] : [title];
  const size = Math.max(...lines.map((line) => line.length)) > 6 ? 62 : 84;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="600" height="900" fill="url(#g)"/>
<circle cx="430" cy="290" r="190" fill="#fff" opacity=".14"/>
${lines.map((line, i) => `<text x="44" y="${680 + i * (size + 8)}" font-family="sans-serif" font-size="${size}" font-weight="800" fill="#fff">${esc(line)}</text>`).join('\n')}
</svg>
`;
}

// 본문 이미지가 여러 장이어도 서로 달라 보이도록 구도를 바꿉니다.
const SCENE_SHAPES = [
  `<circle cx="1120" cy="520" r="130" fill="#fff" opacity=".55"/>
<rect y="620" width="1600" height="280" fill="#000" opacity=".45"/>`,
  `<circle cx="380" cy="240" r="90" fill="#fff" opacity=".4"/>
<path d="M0 900V560l420-200 380 230 340-170 460 240v240z" fill="#000" opacity=".5"/>`,
  `<rect x="640" y="200" width="320" height="700" fill="#000" opacity=".35"/>
<rect x="720" y="280" width="160" height="220" fill="#fff" opacity=".5"/>
<rect y="780" width="1600" height="120" fill="#000" opacity=".5"/>`,
];

const sceneSvg = (from, to, index) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="1600" height="900" fill="url(#g)"/>
${SCENE_SHAPES[index]}
</svg>
`;

const sceneName = (id, index) => `${id}-scene${index === 0 ? '' : `-${index + 1}`}.svg`;
const paragraph = (text) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const sql = (text) => `'${text.replaceAll("'", "''")}'`;
const sqlGenres = (genres) => `ARRAY[${genres.map(sql).join(', ')}]::text[]`;

/** 글, 이미지, 글, 이미지 순서로 번갈아 놓고, 남은 문단을 뒤에 잇습니다. */
function buildBody(id, paragraphs, alts) {
  const content = paragraphs.flatMap((text, index) => [
    paragraph(text),
    ...(alts[index]
      ? [{ type: 'image', attrs: { src: `/seed/${sceneName(id, index)}`, alt: alts[index] } }]
      : []),
  ]);
  content.push({ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'italic' }], text: NOTE }] });
  return { type: 'doc', content };
}

function writeImages({ id, title, from, to, alts }) {
  writeFileSync(`public/seed/${id}-poster.svg`, posterSvg(title, from, to));
  alts.forEach((_, index) => writeFileSync(`public/seed/${sceneName(id, index)}`, sceneSvg(from, to, index)));
}

mkdirSync('public/seed', { recursive: true });

const updates = ORIGINAL_FILMS.map(([id, title, , , , from, to, , alt, first, second]) => {
  const { genres, alt: secondAlt, more } = ORIGINAL_EXTRAS[id];
  const alts = [alt, secondAlt];
  writeImages({ id, title, from, to, alts });
  const body = buildBody(id, [first, second, ...more], alts);
  return `UPDATE reviews SET genres = ${sqlGenres(genres)}, body = ${sql(JSON.stringify(body))}::jsonb WHERE id = ${sql(`sample-${id}`)};`;
});

// 처음 16편의 마지막 글(2026-07-15)부터 한 주씩 거슬러 올라갑니다.
const FIRST_NEW_DATE = Date.UTC(2026, 6, 8, 9);
const WEEK = 7 * 24 * 60 * 60 * 1000;

const rows = NEW_FILMS.map(
  ({ id, title, year, rating, genres, colors: [from, to], alts, paragraphs }, index) => {
    writeImages({ id, title, from, to, alts });
    const at = new Date(FIRST_NEW_DATE - index * WEEK).toISOString();
    return `  (${[sql(`sample-${id}`), sql(title), year, rating, sqlGenres(genres), sql(`/seed/${id}-poster.svg`), `${sql(JSON.stringify(buildBody(id, paragraphs, alts)))}::jsonb`, sql(at), sql(at)].join(', ')})`;
  },
);

writeFileSync(
  OUT,
  `-- scripts/generate-seed.mjs로 만든 가상의 리뷰입니다.
-- 처음 16편의 본문을 늘려 글과 이미지를 번갈아 놓고 장르를 더한 뒤, 20편을 새로 넣습니다.
${updates.join('\n')}

INSERT INTO reviews (id, title, year, rating, genres, poster, body, created_at, updated_at) VALUES
${rows.join(',\n')};
`,
);
