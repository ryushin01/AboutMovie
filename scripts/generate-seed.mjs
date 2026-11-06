// 가상의 영화로 포스터·배경 SVG(public/seed)와 시드 마이그레이션을 만듭니다. 한 번 실행하고 결과를 커밋합니다.
// 적용된 마이그레이션은 고칠 수 없으므로, 내용을 바꾸려면 OUT을 새 파일로 바꿔 새 마이그레이션을 추가합니다.
import { mkdirSync, writeFileSync } from 'node:fs';
import { MOVIES } from './seed-movies.mjs';

const OUT = 'netlify/database/migrations/20261106000100_seed_movies.sql';

const esc = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const sql = (text) => `'${text.replaceAll("'", "''")}'`;
const sqlArray = (items) => `ARRAY[${items.map(sql).join(', ')}]::text[]`;

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

const backdropSvg = (from, to) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="1600" height="900" fill="url(#g)"/>
<circle cx="1120" cy="520" r="130" fill="#fff" opacity=".55"/>
<rect y="620" width="1600" height="280" fill="#000" opacity=".45"/>
</svg>
`;

/** 원어 음성이 기본이고, 가족 영화에는 한국어 더빙을 더합니다. */
const audioOf = (language, genres) => (genres.includes('가족') ? [language, '한국어'] : [language]);

mkdirSync('public/seed', { recursive: true });

const rows = MOVIES.map(
  ([
    id,
    title,
    originalTitle,
    year,
    country,
    language,
    genres,
    director,
    writer,
    cast,
    runtime,
    age,
    advisories,
    moods,
    from,
    to,
    releasedOn,
    firstImport,
    synopsis,
    importNote,
  ]) => {
    writeFileSync(`public/seed/${id}-poster.svg`, posterSvg(title, from, to));
    writeFileSync(`public/seed/${id}-backdrop.svg`, backdropSvg(from, to));
    return `  (${[
      sql(id),
      sql(title),
      sql(originalTitle),
      year,
      sql(country),
      sql(language),
      sqlArray(genres),
      sql(director),
      sql(writer),
      sqlArray(cast),
      runtime,
      sql(age),
      sqlArray(advisories),
      sqlArray(moods),
      sqlArray(audioOf(language, genres)),
      sqlArray(['한국어', '영어']),
      sql(synopsis),
      sql(importNote),
      firstImport,
      sql(releasedOn),
      sql(`/seed/${id}-poster.svg`),
      sql(`/seed/${id}-backdrop.svg`),
    ].join(', ')})`;
  },
);

writeFileSync(
  OUT,
  `-- scripts/generate-seed.mjs로 만든 가상의 영화입니다.
INSERT INTO movies (id, title, original_title, year, country, language, genres, director, writer, cast_members, runtime_minutes, age_rating, advisories, moods, audio_languages, subtitle_languages, synopsis, import_note, first_import, released_on, poster, backdrop) VALUES
${rows.join(',\n')};
`,
);
